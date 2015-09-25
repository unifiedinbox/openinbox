/// <amd-dependency path="mayhem/templating/html!./MessageActions.html" />

import Event = require('mayhem/Event');
import Folder = require('../../models/Folder');
import ui = require('mayhem/ui/interfaces');
import uiUtil = require('../util');
import WebApplication = require('mayhem/WebApplication');
import Widget = require('mayhem/ui/Widget');

var MessageActions = require<any>('mayhem/templating/html!./MessageActions.html');

MessageActions.prototype._selectedActionEventName = 'messageActionSelected';
MessageActions.prototype._hasOpenDropDown = false;

var _render = MessageActions.prototype._render;
MessageActions.prototype._render = function ():void {
	_render.call(this);

	var app:WebApplication = <any> this.get('app');

	this.on('activate', (event:ui.PointerEvent):void => {
		var widget:Widget = <any> event.target;
		var action:string = <any> widget.get('action');
		var eventName:string = this._selectedActionEventName;

		if (action) {
			uiUtil.closeDropDowns(widget);
		}

		if (action === 'archive' || action === 'trash') {
			var folders:dstore.ICollection<Folder> = (<any> app.get('user')).get('folders');
			var folderName = (action === 'archive') ? 'Archive' : 'Trash';

			folders && folders.filter({ name: folderName }).fetch().then((folders:Folder[]):void => {
				var folder:Folder = folders[0];
				var folderId:number = folder && <any> folder.get('id');

				this._emit(eventName, { property: 'folderId', value: folderId });
			});
		}
		else {
			this._emit(eventName, { property: action, value: widget.get('actionValue') });
		}
	});

	this.on('folderSelected', (event:Event):void => {
		var folder:Folder = (<any> event.target).get('model');

		event.stopPropagation();
		uiUtil.closeDropDowns(<any> event.target);
		this._emit(this._selectedActionEventName, { property: 'folderId', value: folder && folder.get('id') });
	});

	this.on('dropDownOpen', (event:Event):void => {
		this.set('hasOpenDropDown', true);
	});
};

MessageActions.prototype._emit = function (type:string, target:any):void {
	if (type && target) {
		this.emit(new Event({
			type: type,
			bubbles: true,
			cancelable: false,
			target: target
		}));
	}
};

MessageActions.prototype.reset = function (detach?:boolean):void {
	(<any> this.get('model')).set({
		isOpen: false,
		folderSearch: ''
	});

	if (detach) {
		this.set('parent', null);
	}
};

export = MessageActions;
