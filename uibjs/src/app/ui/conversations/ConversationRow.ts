/// <amd-dependency path="mayhem/templating/html!./ConversationRow.html" />

import ui = require('mayhem/ui/interfaces');
import uiUtil = require('../util');
import Widget = require('mayhem/ui/Widget');

var ConversationRow = require<any>('mayhem/templating/html!./ConversationRow.html');

var _render = ConversationRow.prototype._render;
ConversationRow.prototype._render = function ():void {
	_render.call(this);

	this.on('activate', function (event:ui.PointerEvent):void {
		var widget:Widget = <any> event.target;

		uiUtil.closeDropDowns(widget);
	});
};

export = ConversationRow;
