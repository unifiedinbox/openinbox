/// <amd-dependency path="mayhem/templating/html!app/ui/Attachments.html" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import lang = require('dojo/_base/lang');
import WebApplication = require('mayhem/WebApplication');
import Attachment = require('app/models/Attachment');
import ViewModel = require('app/viewModels/Attachments');

var app:WebApplication;
var viewModel = new ViewModel();
var id:number;
var item:ViewModel.Proxy;

function createApp(kwArgs?:HashMap<any>) {
	app = new WebApplication({
		name: 'Test',
		components: {
			i18n: { preload: [ 'app/nls/main' ] },
			router: null,
			ui: { view: null }
		}
	});

	return app.run();
}

registerSuite({
	name: 'app/viewModels/Attachments',

	before() {
		return createApp();
	},

	beforeEach() {
		item = new ViewModel.Proxy({ target: new Attachment({
			app: app
		}) });
	},

	after() {
		app.destroy();
	},

	'iconClass (and extension) getter'() {
		var fileExtensions = ViewModel.fileExtensions;
		for (var extension in fileExtensions) {
			item.set('name', 'test.' + extension);
			assert.strictEqual(item.get('extension'), extension,
				'extension getter should return the filename\'s extension');
			assert.strictEqual(item.get('iconClass'), 'icon-app-file-' + fileExtensions[extension],
				'iconClass getter should return the expected CSS class name');
		}

		// Test unrecognized extension for default icon
		item.set('name', 'test.unrecognizable');
		assert.strictEqual(item.get('iconClass'), item.get('defaultIconClass'),
			'Unrecognized file extension should generate default iconClass');
	},

	readableSize() {
		var units = ['kb', 'mb', 'gb'];
		var messages:any = (<any> app.get('i18n')).get('messages');

		item.set('size', 1023);
		assert.strictEqual(item.get('readableSize'), '1023 ' + messages.b(),
			'size under 1KB (1024 B) should be expressed in bytes');

		for (var i = 0, length = units.length; i < length; i++) {
			var size = Math.pow(1024, i + 1);

			// Test exactly 1 unit
			item.set('size', size);
			assert.strictEqual(item.get('readableSize'), '1 ' + messages[units[i]]());

			// Test rounding to higher number of same unit
			item.set('size', Math.round(size * 1.6));
			assert.strictEqual(item.get('readableSize'), '2 ' + messages[units[i]]());
		}

		// Test TB separately since there is no upper bound
		item.set('size', Math.pow(1024, 4));
		assert.strictEqual(item.get('readableSize'), '1 ' + messages['tb']());

		item.set('size', Math.pow(1024, 5));
		assert.strictEqual(item.get('readableSize'), '1024 ' + messages['tb']());
	}
});
