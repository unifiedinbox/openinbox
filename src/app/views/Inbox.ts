/// <amd-dependency path="mayhem/templating/html!app/views/Inbox.html" />

import AlertList = require('../ui/AlertList');
import appUi = require('../ui/interfaces');
import bindings = require('mayhem/binding/interfaces');
import Event = require('mayhem/Event');
import FolderRow = require('../ui/folders/FolderRow');
import lang = require('dojo/_base/lang');
import Message = require('../models/Message');
import MessageComposition = require('../ui/MessageComposition');
import MessageCompositionProxy = require('../viewModels/MessageComposition');
import RecentlyUsedFolder = require('../models/RecentlyUsedFolder');
import util = require('../util');

var Inbox = require<any>('mayhem/templating/html!app/views/Inbox.html');

Inbox.prototype._bindingHandles = null; // IHandle[]
Inbox.prototype._composerHandle = null; // IHandle

var destroy = Inbox.prototype.destroy;
Inbox.prototype.destroy = function ():void {
	destroy.call(this);

	this._alertList = null;
	this._composerHandle && this._composerHandle.remove();
	this._bindingHandles.forEach(function (handle:IHandle):void {
		handle.remove();
	});
};

var _initialize = Inbox.prototype._initialize;
Inbox.prototype._initialize = function ():void {
	_initialize.call(this);

	this._bindingHandles = [];
};

var _render = Inbox.prototype._render;
Inbox.prototype._render = function ():void {
	_render.call(this);

	this._registerBindings();
	this._registerEvents();
};

Inbox.prototype.compose = function ():void {
	this.get('model').set('isInCompositionMode', true);
};

Inbox.prototype.toggleSidebar = function ():void {
	var model = this.get('model');
	model.set('isSidebarVisible', !model.get('isSidebarVisible'));
};

Inbox.prototype.toggleActions = function ():void {
	var model = this.get('model');
	model.set('isActionsVisible', !model.get('isActionsVisible'));
};

Inbox.prototype._closeComposer = function (event?:appUi.IMessageEvent):void {
	var eventModel = event && event.target.get('model');

	if (eventModel && eventModel.get('draftSaveOnClose')) {
		(<any> Message.store).saveAsDraft(event.message, eventModel.get('compositionAction'));
	}

	this.set('composer', null);
	this.get('model').set('isInCompositionMode', false);
	this._composerHandle.remove();
};

Inbox.prototype._openComposer = function ():void {
	var app = this.get('app');
	var model = this.get('model');
	var message:Message = model.get('compositionMessage');

	if (!message) {
		message = new Message({ app: app });
		message.set('scenario', 'new');
	}

	var composerModel = new MessageCompositionProxy({
		target: message,
		source: model.get('compositionMessageSource'),
		compositionAction: model.get('compositionAction')
	});
	var composer = new MessageComposition({
		app: app,
		model: composerModel
	});

	this.set('composer', composer);

	this._composerHandle = app.get('binder').createBinding(composerModel, 'isOpen')
		.observe((change:bindings.IChangeRecord<boolean>):void => {
			if (!change.value) {
				this._closeComposer();
			}
		});
};

Inbox.prototype._registerBindings = function ():void {
	var binder = this.get('app').get('binder');
	var self = this;

	this._bindingHandles.push(binder.createBinding(this.get('model'), 'isInCompositionMode')
		.observe(function (change:bindings.IChangeRecord<boolean>):void {
			var method:string = change.value ? '_openComposer' : '_closeComposer';
			self[method]();
		}));
};

Inbox.prototype._registerEvents = function ():void {
	this.on('folderSelected', function (event:UIEvent) {
		var folderRow:FolderRow = <any> event.target;

		this.get('app').get('router').go('inbox', { folderId: folderRow.get('model').get('id') });
	});

	this._registerMessageEvents();
	this._registerMessageFilterEvents();
	this._registerSearchEvents();
};

Inbox.prototype._registerMessageEvents = function ():void {
	this.on('messageSelected', (event:Event):void => {
		var message:Message = util.getProxyTarget(<any> event.target.get('model'));

		this.get('model').set({
			message: message,
			showConversation: true
		});
	});

	this.on('messageCompositionClose', this._closeComposer.bind(this));

	this.on('messageCompose', (event:appUi.IMessageEvent):void => {
		var message:Message = event.message;

		if (!event.message && event.source) {
			message = (event.action === 'forward') ?
				Message.getForwardMessage(event.source) :
				Message.getReplyMessage(event.source, (<any> Message.ReplyType)[event.action]);
		}

		if (message) {
			this.get('model').set({
				compositionAction: event.action,
				compositionMessage: message,
				compositionMessageSource: event.source
			});
		}
	});

	this.on('messageRowFolderChange', (event:Event):void => {
		var message = (<any> event.target).get('model');
		var recentlyUsedFolders = this.get('app').get('user').get('session').get('recentlyUsedFolders');

		recentlyUsedFolders.put(new RecentlyUsedFolder({
			id: message.get('folderId'),
			lastUsedDate: Date.now()
		}));
	});

	// TODO: Since the AlertList widgets expects its `add` method to be called, we are forced to
	// gain access to it in order to queue alerts. Instead it would be better if an array of
	// active alert objects could be passed into it.
	this.on('messageSend', (event:appUi.IMessageEvent):void => {
		if (!this._alertList) {
			this._setAlertList();
		}

		var messages = this.get('app').get('i18n').get('messages');
		this._alertList && this._alertList.add({
			message: messages.messageSent(),
			command: {
				commit: function () {
					(<any> Message.store).send(event.message);
				}
			}
		});

		if (this.get('model').get('isInCompositionMode')) {
			this._closeComposer();
		}
	});
};

Inbox.prototype._registerMessageFilterEvents = function ():void {
	this.on('messageFilterSelect', (event:Event):void => {
		this.get('model').set('messageFilter', (<any> event.target).get('model').get('selectedFilter'));
	});

	this.on('messageSearchFilterSelect', (event:Event):void => {
		this.get('model').set('messageSearchFilter', (<any> event.target).get('model').get('selectedSearchFilter'));
	});

	this.on('messageSortSelect', (event:Event):void => {
		this.get('model').set('messageSort', (<any> event.target).get('model').get('selectedSort'));
	});

	this.on('messageFilterConnectionsSelect', (event:Event):void => {
		this.get('model').set('messageConnectionsFilter',
			(<any> event.target).get('model').get('selectedConnections'));
	});
};

Inbox.prototype._registerSearchEvents = function ():void {
	this.on('messageFetchRange', lang.hitch(this, '_updateMessageCount', 'messageCount'));
	this.on('searchFetchRange', lang.hitch(this, '_updateMessageCount', 'searchResultCount'));

	this.on('masterSearchFocus', (event:Event):void => {
		this.get('model').set('masterSearchIsFocused', (<any> event.target).get('isFocused'));
	});

	this.on('masterSearchChange', (event:Event):void => {
		this.get('model').set('masterSearchValue', (<any> event.target).get('search'));
	});

	this.on('masterSearchSubmit', (event:Event):void => {
		this.get('model').set('masterSearchSubmitValue', (<any> event.target).get('search'));
	});

	this.on('searchResultSelected', (event:Event):void => {
		this.get('model').set('masterSearchSubmitValue', (<any> event).item);
	});
};

Inbox.prototype._setAlertList = function ():void {
	var children = this._children;

	for (var i = children.length; i--;) {
		if (children[i] instanceof AlertList) {
			this._alertList = children[i];
			break;
		}
	}
};

Inbox.prototype._updateMessageCount = function (property:string, event:Event):void {
	var model = this.get('model');

	if (property) {
		this.get('model').set('isFetching', false);
		model.set(property, (<any> event.target).get('totalLength'));
	}
};

export = Inbox;
