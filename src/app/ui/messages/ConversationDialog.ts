import appUtil = require('../../util');
import Conversation = require('../../models/Conversation');
import ConversationView = require('./Conversation');
import Dialog = require('mayhem/ui/dom/Dialog');
import Message = require('../../models/Message');
import NotificationObserver = require('app/auth/NotificationObserver');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');

class ConversationDialog extends Dialog {
	get:ConversationDialog.Getters;
	set:ConversationDialog.Setters;

	protected _bindingHandles:IHandle[];
	protected _closeClickListener:IHandle;
	protected _conversation:ConversationView;

	protected _collection:dstore.ICollection<Conversation>;
	_collectionGetter():dstore.ICollection<Conversation> {
		return this._collection;
	}
	_collectionSetter(value:dstore.ICollection<Conversation>):void {
		this._collection = value;

		if (value) {
			this._conversation.set('collection', value);
		}
	}

	_isOpenSetter(value:boolean) {
		super._isOpenSetter(value);

		if (value) {
			this._closeClickListener = this.get('app').get('ui').on('activate', this._closeClickHandler.bind(this));
		}
		else {
			this._conversation.reset();

			if (this._closeClickListener) {
				this._closeClickListener.remove();
				this._closeClickListener = null;
			}
		}
	}

	protected _message:Message;
	_messageGetter():Message {
		return this._message;
	}
	_messageSetter(value:Message):void {
		this._message = value;

		if (value) {
			this._conversation.set('message', value);
		}
	}

	protected _notifications:NotificationObserver;
	_notificationsGetter():NotificationObserver {
		return this._notifications;
	}
	_notificationsSetter(value:NotificationObserver):void {
		this._notifications = value;

		if (value) {
			this._conversation.set('notifications', value);
		}
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection', 'message', 'notifications' ], '_render');
		super(kwArgs);
	}

	destroy() {
		super.destroy();
		if (this._closeClickListener) {
			this._closeClickListener.remove();
			this._closeClickListener = null;
		}
		this._bindingHandles.forEach(function (handle) {
			handle.remove();
		});
	}

	_render() {
		super._render();

		this._conversation = new ConversationView({
			app: this.get('app')
		});

		this.add(<any> this._conversation);
		(<any> this.get('firstNode')).classList.add('ConversationDialog');

		// FIXME: Dijit should handle closing the dialog if escape is pressed, but this doesn't work if anything
		// inside the dialog is clicked first.  Moreover, adding a keyboard handler via Mayhem here doesn't fix it,
		// and breaks things in the case where Dijit already works.
	}

	_closeClickHandler(event:ui.PointerEvent) {
		// FIXME: This is intended to dismiss the dialog when the user clicks outside it,
		// but it doesn't work because apparently Mayhem thinks that the dialog contains the underlay.
		if (!appUtil.contains(this, <any> event.target)) {
			// this.set('isOpen', false);
		}
	}
}

module ConversationDialog {
	export interface Getters extends Dialog.Getters {
		(key:'collection'):dstore.ICollection<Conversation>;
		(key:'message'):Message;
		(key:'notifications'):NotificationObserver;
	}

	export interface Setters extends Dialog.Setters {
		(key:'collection', value:dstore.ICollection<Conversation>):void;
		(key:'message', value:Message):void;
		(key:'notifications', value:NotificationObserver):void
	}
}

export = ConversationDialog;
