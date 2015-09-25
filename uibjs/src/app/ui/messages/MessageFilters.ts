/// <amd-dependency path="mayhem/templating/html!app/ui/messages/MessageFilters.html" />

import Event = require('mayhem/Event');
import lang = require('dojo/_base/lang');
import ui = require('mayhem/ui/interfaces');
import uiUtil = require('../util');
import Widget = require('mayhem/ui/Widget');

var MessageFilters = require<any>('mayhem/templating/html!app/ui/messages/MessageFilters.html');

var _render = MessageFilters.prototype._render;
MessageFilters.prototype._render = function ():void {
	_render.call(this);

	this.on('messageConnectionListChange', (event:Event):void => {
		this.get('model').set('selectedConnections', event.target);
		this._emit('messageFilterConnectionsSelect');
	});

	this.on('messageConnectionListClosed', (event:Event):void => {
		this.get('model').set('isOpen', false);
	});

	// Note: in order to capture events from the drop down containers, the `activate` event listener
	// needs to be registered on a widget that is in those containers' parent chain.
	this.on('activate', lang.hitch(this, 'selectFilter'));
};

MessageFilters.prototype.toggleMenu = function ():void {
	var model = this.get('model');
	model.set('isOpen', !model.get('isOpen'));
};

MessageFilters.prototype.selectFilter = function (event:ui.ClickEvent):void {
	var clicked:Widget = <any> event.target;
	var type:string = <any> clicked.get('actionType');
	var value:string = <any> clicked.get('actionValue');

	if (type && value) {
		var model = this.get('model');
		var suffix:string = type.charAt(0).toUpperCase() + type.slice(1);
		var property:string = 'selected' + suffix;

		model.set(property, value);
		model.set('isOpen', false);
		uiUtil.closeDropDowns(event.target);

		this._emit('message' + suffix + 'Select');
	}
};

MessageFilters.prototype._emit = function (type:string):void {
	if (type) {
		this.emit(new Event({
			type: type,
			bubbles: true,
			cancelable: false,
			target: this
		}));
	}
};

export = MessageFilters;
