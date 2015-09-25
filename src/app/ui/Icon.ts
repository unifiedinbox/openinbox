/**
 * Displays an icon from the "uib-app-related-icons" font. Can be a Mayhem event target.
 *
 * Usage:
 *
new Icon({
	value: 'app-delete',
	className: 'SuperIcon',
	app: this.get('app'),
	parent: this
});
 *
 * value: the suffix of the CSS class name for the icon (see icons.styl).
 *     Should be "app-<something>" or "service-<something>"
 * className (optional): a CSS class name to apply to the icon element
 * app: the app
 * parent: the parent widget (this is important for traversing up the widget hierarchy in the event handler)
 */

import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');

class Icon extends SingleNodeWidget {
	get:Icon.Getters;
	set:Icon.Setters;

	_node:HTMLElement;

	protected _className:string;
	protected _value:string;

	_initialize():void {
		super._initialize();

		this._className = '';
		this._value = 'app-cancel';
	}

	_render():void {
		var className = this.get('className');

		this._node = document.createElement('i');
		this._node.className = 'icon-' + this.get('value') +
			(className ? ' ' + className : '');
	}
}

module Icon {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'value'):string;
		(key:'className'):string;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'value', value:string):void;
		(key:'className', className:string):void;
	}
}

export = Icon;
