import Event = require('mayhem/Event');
import MessageActions = require('./MessageActions');

function BulkMessageActions() {
	return MessageActions.apply(this, arguments);
};

BulkMessageActions.prototype = Object.create(MessageActions.prototype);
BulkMessageActions.prototype._selectedActionEventName = 'bulkMessageActionSelected';

var _render = BulkMessageActions.prototype._render;
BulkMessageActions.prototype._render = function ():void {
	_render.call(this);

	this.on('bulkMessageActionSelected', (event:Event):void => {
		event.stopPropagation();
		(<any> this.get('app')).set('bulkMessageAction', event.target);
	});
};

export = BulkMessageActions;
