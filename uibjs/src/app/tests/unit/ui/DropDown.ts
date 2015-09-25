/// <amd-dependency path="mayhem/templating/html!./DropDownTemplate.html" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import View = require('mayhem/ui/View');
import WebApplication = require('mayhem/WebApplication');

var DropDown:{
	new (kwArgs?:{}):View;
	prototype:View;
};
interface DropDown extends View {}
DropDown = require<typeof DropDown>('mayhem/templating/html!./DropDownTemplate.html');

var app:WebApplication;
var dropDown:DropDown;
var className:string;

registerSuite({
	name: 'app/ui/Avatar',

	beforeEach() {
		return createApp();
	},

	afterEach() {
		app.destroy();
	},

	dropDownClassName():void {
		if (!has('host-browser')) {
			this.skip('requires browser');
		}

		assert.isNotNull(document.querySelector('.' + className));
	},

	isOpen() {
		if (!has('host-browser')) {
			this.skip('requires browser');
		}

		var node:HTMLElement = <any> document.querySelector('.' + className);
		assert.isFalse(node.classList.contains('open'), 'DropDown should be closed by default.');

		dropDown.set('isOpen', true);
		assert.isTrue(node.classList.contains('open'),
			'When `isOpen` is true, the drop down container should have an `open` class.');
	}
});

function createApp(kwArgs?:HashMap<any>) {
	app = new WebApplication({
		name: 'Test',
		components: {
			router: null,
			ui: { view: null }
		}
	});

	return app.run().then(function () {
		className = 'DropDownContainer--' + String(Date.now());
		dropDown = new DropDown(lang.mixin(<HashMap<any>>{}, kwArgs, { app: app, dropDownClassName: className }));
		app.get('ui').set('view', dropDown);
	});
}
