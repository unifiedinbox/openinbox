/// <amd-dependency path="mayhem/templating/html!./MessageRow.html" />

import appUi = require('../interfaces');
import appUtil = require('../../util');
import bindings = require('mayhem/binding/interfaces');
import Event = require('mayhem/Event');
import lang = require('dojo/_base/lang');
import Message = require('../../models/Message');
import ui = require('mayhem/ui/interfaces');

var MessageRow = require<any>('mayhem/templating/html!./MessageRow.html');

var destroy = MessageRow.prototype.destroy;
MessageRow.prototype.destroy = function ():void {
	destroy.call(this);

	this._ownBindingHandles.forEach(function (handle:IHandle):void {
		handle.remove();
	});
};

var _initialize = MessageRow.prototype._initialize;
MessageRow.prototype._initialize = function ():void {
	_initialize.call(this);

	// Use `_ownBindingHandles` to avoid collisions with ElementWidget#_bindingHandles`.
	this._ownBindingHandles = []; // IHandle[]

	this.on('messageActionSelected', (event:Event):void => {
		var property = event.target.property;

		event.stopPropagation();

		if (property) {
			this.get('model').set(property, event.target.value);

			if (property === 'compositionAction') {
				this.emit(new MessageEvent({
					type: 'messageCompose',
					bubbles: true,
					cancelable: false,
					target: this,
					source: appUtil.getProxyTarget(this.get('model')),
					action: event.target.value
				}));
			}
			else if (property === 'folderId') {
				// XXX: This is a hack to remove the message row when the message is moved.
				// Ideally the store could notify properly, but Message store is not in-memory,
				// and so delete/add events can't be properly communicated with indices.
				// Also ideally we would destroy this row, but it seems that doing that
				// catches MessageActions in the destruction - even if we try to nullify its parent first.
				this.detach();

				this._emit('messageRowFolderChange');
			}
		}
	});

	this.on('pointerenter', lang.hitch(this, '_emit', 'messageRowPointerEnter'));
	this.on('pointerleave', lang.hitch(this, '_emit', 'messageRowPointerLeave'));
};

var _render = MessageRow.prototype._render;
MessageRow.prototype._render = function ():void {
	_render.call(this);

	// TODO: This is not ideal, but since the event system only works one way, and since the Message store
	// does not have access to the underlying object (they are retrieved from the database), this is the
	// only way to prevent the widget from trying to prematurately render attachments.
	var binder = this.get('app').get('binder');

	this._ownBindingHandles.push(binder.createBinding(this.get('app'), 'isInSearchMode')
		.observe((change:bindings.IChangeRecord<boolean>):void => {
			var model = this.get('model');

			if (model) {
				model.set('showAttachments', change.value && model.get('hasAttachment'));
			}
		}));
};

MessageRow.prototype.selectMessage = function (event:ui.ClickEvent):void {
	if ((<any> event.target.get('name')) !== 'messageRowActions') {
		this._emit('messageSelected');
	}
};
MessageRow.prototype.toggleStar = function (event:ui.ClickEvent):void {
	var model = this.get('model');
	model.set('isStarred', !model.get('isStarred'));
	event.stopPropagation();
};
MessageRow.prototype.toggleSelected = function (event:ui.ClickEvent):void {
	var model = this.get('model');
	model.set('isSelected', !model.get('isSelected'));
	event.stopPropagation();
};
MessageRow.prototype._emit = function (type:string, event?:ui.PointerEvent):void {
	this.emit(new Event({
		type: type,
		bubbles: true,
		cancelable: false,
		target: this,
		relatedTarget: event && event.relatedTarget || null
	}));
};

class MessageEvent extends Event implements appUi.IMessageEvent {
	message:Message;
	source:Message;
	action:string;
}

MessageRow.MessageEvent = MessageEvent;

export = MessageRow;
