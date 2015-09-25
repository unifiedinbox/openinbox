/// <amd-dependency path="mayhem/templating/html!./AttachmentPreviews.html" />
/// <amd-dependency path="mayhem/templating/html!./QuickReply.html" />

import appUi = require('../interfaces');
import appUtil = require('../../util');
import Contact = require('../../models/Contact');
import Event = require('mayhem/Event');
import Folder = require('../../models/Folder');
import Label = require('mayhem/ui/Label');
import MayhemTemplate = require('mayhem/ui/View');
import Message = require('../../models/Message');
import MessageProxy = require('../../viewModels/QuickReply');
import MultiNodeWidget = require('mayhem/ui/dom/MultiNodeWidget');
import SelectionManager = require('../../viewModels/SelectionManager');
import ui = require('mayhem/ui/interfaces');
import uiUtil = require('../util');
import util = require('mayhem/util');

var AttachmentsWidget = require<any>('mayhem/templating/html!./AttachmentPreviews.html');
var Template:MayhemTemplate = require<any>('mayhem/templating/html!./QuickReply.html');

interface ISelectable extends SelectionManager.SelectableProxy<Contact> {}

class QuickReply extends MultiNodeWidget {
	get:QuickReply.Getters;
	set:QuickReply.Setters;

	_node:HTMLElement;

	_isAttachedSetter(value:boolean):void {
		this._isAttached = value;
		this._widget.set('isAttached', value);
	}

	protected _isOpen:boolean;
	_isOpenGetter():boolean {
		return this._isOpen;
	}
	_isOpenSetter(value:boolean):void {
		this._isOpen = value;

		if (!value) {
			this.set('message', this._message.get('source'));
		}
	}

	protected _message:MessageProxy;
	_messageGetter():MessageProxy {
		return this._message;
	}
	_messageSetter(value:Message):void {
		if (value) {
			this._message = new MessageProxy({
				app: this.get('app'),
				source: value,
				target: Message.getReplyMessage(value)
			});

			this._widget.set('model', this._message);
			this._renderAttachments();

			this._messageHandle && this._messageHandle.remove();
			this._messageHandle = this.get('app').get('binder').bind({
				source: this,
				sourcePath: 'replyType',
				target: this._message,
				targetPath: 'replyType'
			});
		}
	}

	protected _messageHandle:IHandle;
	protected _selectedRecipients:Contact[];
	protected _widget:MayhemTemplate;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'isOpen', 'message' ], '_render');
		super(kwArgs);
	}

	delete():void {
		// TODO: Shouldn't this just close the quick reply and discard any changes?
		this._emit('quickReplyDelete');
	}

	destroy():void {
		super.destroy();

		this._widget.destroy();
		this._message = null;
		this._messageHandle && this._messageHandle.remove();
	}

	expand():void {
		this._emit('messageCompose');
	}

	forward():void {
		this._emit('messageCompose', 'forward');
	}

	_render():void {
		super._render();

		this._widget = new (<any> Template)({
			app: this.get('app'),
			parent: this
		});

		var lastNode = this.get('lastNode');
		lastNode.parentNode.insertBefore(this._widget.detach(), lastNode);

		this._delegateEvents();
		this._registerEvents();
	}

	send():void {
		var moveToFolder:Folder = this._message.get('selectedFolder');

		this.set('isOpen', false);
		this._emit('messageSend');

		if (moveToFolder) {
			this._message.get('source').set('folderId', moveToFolder.get('id'));
		}
	}

	toggleMoveToFolder():void {
		this._message.set('moveToFolder', !this._message.get('moveToFolder'));
	}

	protected _delegateEvents():void {
		// TODO: This is not very elegant, but is required if we want to use TS classes with views.
		[ 'expand', 'forward', 'send', 'delete', 'toggleMoveToFolder' ].forEach((method:string):void => {
			(<any> this._widget)[method] = (<any> this)[method].bind(this);
		});
	}

	protected _emit(type:string, action?:string):void {
		if (type) {
			this.emit(new QuickReply.SendEvent({
				type: type,
				bubbles: true,
				cancelable: false,
				target: this,
				message: this._message.get('target'),
				action: action || null
			}));
		}
	}

	protected _handleFolderSelection(event:Event):void {
		var folder:Folder = (<any> event.target).get('model');
		var message:MessageProxy = this.get('message');

		event.stopPropagation();

		message.set('selectedFolder', folder);
		uiUtil.closeDropDowns(<any> event.target);
	}

	protected _handleReplyMenuAction(event:ui.PointerEvent):void {
		var target:Label = <any> event.target;

		if (!(target instanceof Label)) {
			return;
		}

		var message:MessageProxy = <any> this.get('message');
		var action:any = target.get('action');

		// This listener will catch events on more targets than we are interested in, so make sure we ignore others
		if (action in { reply: 1, replyAll: 1, forward: 1 }) {
			uiUtil.closeDropDowns(target);
		}

		if (action === 'forward') {
			this.forward();
			return;
		}

		message.set('replyType', (action === 'replyAll') ? Message.ReplyType.ReplyAll : Message.ReplyType.Reply);
	}

	protected _registerEvents():void {
		this.on('activate', this._handleReplyMenuAction.bind(this));
		this.on('updateRecipients', this._updateRecipients.bind(this));
		this.on('folderSelected', this._handleFolderSelection.bind(this));
	}

	protected _renderAttachments():void {
		this._widget.set('attachmentsWidget', new AttachmentsWidget({
			app: this.get('app'),
			parent: this,
			model: this._message.get('attachmentsModel')
		}));
	}

	protected _updateRecipients(event:Event):void {
		var recipients = event.target.get('value');

		recipients.fetch().then((contactProxies:ISelectable[]):void => {
			var contacts:Contact[] = contactProxies.map(appUtil.getProxyTarget);
			var message = this.get('message');

			message.set({
				selectedRecipients: contacts,
				to: contacts.map(function (contact:Contact):string {
					return contact.get('displayName');
				})
			});
		});
	}
}

module QuickReply {
	export interface Getters extends MultiNodeWidget.Getters {
		(key:'isOpen'):boolean;
		(key:'message'):MessageProxy;
		(key:'replyType'):Message.ReplyType;
	}

	export interface Setters extends MultiNodeWidget.Setters {
		(key:'isOpen', value:boolean):void;
		(key:'message', value:MessageProxy):void;
		(key:'replyType', value:Message.ReplyType):void;
	}

	export class SendEvent extends Event implements appUi.IMessageEvent {
		message:Message;
		action:string;
	}
}

export = QuickReply;
