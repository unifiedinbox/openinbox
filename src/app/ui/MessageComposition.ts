/// <amd-dependency path="mayhem/templating/html!./messages/AttachmentPreviews.html" />
/// <amd-dependency path="mayhem/templating/html!./MessageComposition.html" />

import appUi = require('./interfaces');
import Event = require('mayhem/Event');
import Proxy = require('mayhem/data/Proxy');
import ContactModel = require('../models/Contact');
import Folder = require('../models/Folder');
// import FolderStore = require('../models/stores/Folder');
import Message = require('../models/Message');
import MessageProxy = require('../viewModels/MessageComposition');
import MessageStore = require('../models/stores/Message'); MessageStore;
import RecipientsInput = require('./messages/RecipientsInput');
import RecipientList = require('../ui/contacts/RecipientList');
import ui = require('mayhem/ui/interfaces');
import uiUtil = require('../ui/util');

var AttachmentPreviews = require<any>('mayhem/templating/html!./messages/AttachmentPreviews.html');
var MessageComposition = require<any>('mayhem/templating/html!./MessageComposition.html');

var _render = MessageComposition.prototype._render;
MessageComposition.prototype._render = function ():void {
	_render.call(this);

	var model:MessageProxy = this.get('model');

	this.on('folderSelected', this._handleFolderSelection.bind(this));
	this.on('updateRecipients', this._handleUpdateRecipients.bind(this));
	this.on('recipientAdded', this._updateRecipientField.bind(this));
	this.on('recipientRemoved', this._updateRecipientField.bind(this));

	this.set('attachmentsWidget', new AttachmentPreviews({
		app: this.get('app'),
		parent: this,
		model: model.get('attachmentsModel')
	}));
};

MessageComposition.prototype._updateRecipientField = function (event:RecipientsInput.RecipientEvent):void {
	var input:RecipientsInput = <any> event.target;
	var field:string = input.get('id');
	var value:string[] = <any> input.get('value');

	if (field && value) {
		this.get('model').set(field, value);
	}
};

MessageComposition.prototype._handleFolderSelection = function (event:UIEvent) {
	var folder:Folder = (<any> event.target).get('model');
	var model:MessageProxy = this.get('model');

	event.stopPropagation();

	model.set('selectedFolder', folder);
	uiUtil.closeDropDowns(<any> event.target);
};

MessageComposition.prototype._handleUpdateRecipients = function (event:UIEvent) {
	var viewModel:MessageProxy = this.get('model');
	var recipientList:RecipientList = <any> event.target;
	var selectedRecipients = recipientList.get('value');
	var currentRecipients = (<any> viewModel.get('selectedRecipients')).slice();

	// TODO: Ideally, SelectionManager and anything that consumes it would provide an option for
	// selecting items by default (as well as for enforcing a min/max number of selections). In
	// the meantime, we will have to rely on re-updating the selected list on initialize.
	if (!this._isDefaultRecipientsSet) {
		this._isDefaultRecipientsSet = true;

		viewModel.set('selectedRecipients', currentRecipients);
	}
	else {
		selectedRecipients.fetch().then(function (contacts:Proxy<ContactModel>[]) {
			viewModel.set('selectedRecipients', contacts);
		});
	}
};

MessageComposition.prototype.send = function (event:UIEvent):void {
	var model:MessageProxy = this.get('model');
	var moveToFolder:Folder = model.get('selectedFolder');
	var message:Message = <any> (model.get('source') || model.get('target'));

	this._emit('messageSend');
	this.close();

	if (moveToFolder) {
		message.set('folderId', moveToFolder.get('id'));
	}
};

MessageComposition.prototype.close = function ():void {
	this._emit('messageCompositionClose');
};

MessageComposition.prototype.draftSaveOnClose = function (event:UIEvent):void {
	var model:MessageProxy = this.get('model');

	model.set('draftSaveOnClose', !model.get('draftSaveOnClose'));
};

MessageComposition.prototype.highPriority = function ():void {
	this._setPriority(Message.Priority.High);
};

MessageComposition.prototype.lowPriority = function ():void {
	this._setPriority(Message.Priority.Low);
};

MessageComposition.prototype.standardPriority = function ():void {
	this._setPriority(Message.Priority.Normal);
};

MessageComposition.prototype.toggleMoveToFolder = function ():void {
	var model:MessageProxy = this.get('model');

	model.set('moveToFolder', !model.get('moveToFolder'));
};

MessageComposition.prototype.togglePriority = function ():void {
	var model:MessageProxy = this.get('model');

	model.set('showPriority', !model.get('showPriority'));
};

MessageComposition.prototype.toggleShowCc = function ():void {
	this.get('model').set({
		showCc: !this._showCc,
		showBcc: false,
		cc: [],
		bcc: []
	});
};

MessageComposition.prototype.toggleShowBcc = function ():void {
	this.get('model').set({
		showBcc: !this._showBcc,
		bcc: []
	});
};

MessageComposition.prototype.trash = function ():void {
	this.get('model').set('draftSaveOnClose', false);
	this._emit('messageCompositionClose');
	this.close();
};

MessageComposition.prototype._emit = function(type:string, event?:ui.PointerEvent):void {
	if (type) {
		this.emit(new MessageEvent({
			type: type,
			bubbles: true,
			cancelable: false,
			target: this,
			message: this.get('model').get('target')
		}));
	}
};

MessageComposition.prototype._setPriority = function (priority:Message.Priority):void {
	this.get('model').set('priority', priority);
	this.togglePriority();
};

class MessageEvent extends Event implements appUi.IMessageEvent {
	message:Message;
	action:string;
}

MessageComposition.MessageEvent = MessageEvent;

export = MessageComposition;
