/// <amd-dependency path="mayhem/templating/html!./ConversationActions.html" />

import appUi = require('../interfaces');
import Conversation = require('../../models/Conversation');
import ConversationList = require('../conversations/ConversationList');
import Event = require('mayhem/Event');
import Label = require('mayhem/ui/dom/Label');
import Message = require('../../models/Message');
import MessageActions = require('./MessageActions');
import MessageActionsViewModel = require('../../viewModels/MessageActions');
import MessageNotification = require('../MessageNotification');
import MessageProxy = require('../../viewModels/MessageList');
import MessageRow = require('./MessageRow');
import NotificationObserver = require('app/auth/NotificationObserver');
import Observable = require('mayhem/Observable');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import Widget = require('mayhem/ui/Widget');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');

var ConversationActions = require<any>('mayhem/templating/html!./ConversationActions.html');

class ConversationView extends SingleNodeWidget {
	get:ConversationView.Getters;
	set:ConversationView.Setters;

	protected _collection:dstore.ICollection<Conversation>;
	_collectionGetter():dstore.ICollection<Conversation> {
		return this._collection;
	}
	_collectionSetter(value:dstore.ICollection<Conversation>):void {
		this._collection = value;

		if (value) {
			this._conversationList.set('collection', value);
		}
	}

	protected _conversationActions:Widget;
	protected _conversationList:ConversationList;

	_isAttachedSetter(value:boolean):void {
		this._isAttached = value;

		this._conversationActions.set('isAttached', value);
		this._conversationList.set('isAttached', value);
		this._messageNotification.set('isAttached', value);
		this._messageRow.set('isAttached', value);
	}

	protected _message:Message;
	_messageGetter():Message {
		return this._message;
	}
	_messageSetter(value:Message):void {
		this._message = value;

		if (value) {
			var messageRowProxy = new MessageProxy({ target: value });
			this._messageRow.set('model', messageRowProxy);
			this._conversationList.set('message', value);
			(<any> this._messageActions.get('model')).set('message', messageRowProxy);
			(<any> this._conversationActions.get('model')).set('message', value);
		}
	}

	protected _messageActions:Widget;
	protected _messageNotification:MessageNotification;
	protected _messageRow:Widget;

	protected _notifications:NotificationObserver;
	_notificationsGetter():NotificationObserver {
		return this._notifications;
	}
	_notificationsSetter(value:NotificationObserver):void {
		this._notifications = value;

		if (value) {
			this._messageNotification.set('notifications', value);
		}
	}

	_node:HTMLElement;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection', 'message', 'notifications' ], '_render');
		super(kwArgs);
	}

	destroy():void {
		super.destroy();

		this._conversationActions.destroy();
		this._conversationList.destroy();
		this._messageNotification.destroy();
		this._messageRow.destroy();
	}

	forward():void {
		this.emit(new ConversationView.MessageEvent({
			type: 'messageCompose',
			bubbles: true,
			cancelable: false,
			target: this,
			source: this._message,
			action: 'forward',
		}));
	}

	reply():void {
		(<any> this._conversationActions.get('model')).set({
			replyType: Message.ReplyType.Reply,
			showQuickReply: true
		});
	}

	replyAll():void {
		(<any> this._conversationActions.get('model')).set({
			replyType: Message.ReplyType.ReplyAll,
			showQuickReply: true
		});
	}

	reset():void {
		(<any> this._conversationActions.get('model')).set('showQuickReply', false);
	}

	_render():void {
		var app = this.get('app');

		this._node = document.createElement('div');
		this._node.className = 'Conversation';

		this._messageRow = new MessageRow({
			app: app,
			parent: this
		});

		this._messageActions = new MessageActions({
			app: app,
			// TODO: Since this is loaded as a placeholder, setting `parent` is probably not necessary.
			parent: this._messageRow,
			model: new MessageActionsViewModel({
				app: app,
				isOpen: false
			})
		});

		this._messageRow.set('messageActions', this._messageActions);

		this._conversationList = new ConversationList({
			app: app,
			parent: this
		});

		this._messageNotification = new MessageNotification({
			app: app,
			parent: this
		});

		this._conversationActions = new ConversationActions({
			app: app,
			parent: this,
			model: new Observable({
				app: app,
				showQuickReply: false
			})
		});

		this._node.appendChild(this._messageRow.detach());
		this._node.appendChild(this._conversationList.detach());
		this._node.appendChild(this._messageNotification.detach());
		this._node.appendChild(this._conversationActions.detach());

		this._registerEvents();
	}

	protected _registerEvents():void {
		this.on('messageRowPointerEnter', (event:Event):void => {
			(<any> this._messageActions.get('model')).set('isOpen', true);
		});

		this.on('messageRowPointerLeave', (event:Event):void => {
			(<any> this._messageActions.get('model')).set('isOpen', false);
		});

		this.on('messageSend', (event:appUi.IMessageEvent):void => {
			// event deliberately not stopped
			(<any> this._conversationActions.get('model')).set('showQuickReply', false);
		});

		this._conversationActions.on('activate', (event:ui.PointerEvent):void => {
			var label:Label = <any> event.target;
			var action:string = <any> label.get('action');
			var method = action && (<any> this)[action];

			if (typeof method === 'function') {
				event.stopPropagation();
				method.call(this);
			}
		});
	}
}

module ConversationView {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'collection'):dstore.ICollection<Conversation>;
		(key:'message'):Message;
		(key:'notifications'):NotificationObserver;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'collection', value:dstore.ICollection<Conversation>):void;
		(key:'message', value:Message):void;
		(key:'notifications', value:NotificationObserver):void
	}

	export class MessageEvent extends Event implements appUi.IMessageEvent {
		message:Message;
		source:Message;
		action:string;
	}
}

export = ConversationView;
