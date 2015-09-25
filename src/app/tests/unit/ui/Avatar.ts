import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import WebApplication = require('mayhem/WebApplication');

import Avatar = require('app/ui/Avatar');
import eTypeAdapter = require('app/models/adapters/eType');

var app:WebApplication;
var avatar:Avatar;

// URL used for image URL tests
var imageUrl = 'https://avatars2.githubusercontent.com/u/398379?v=3&s=72';

function createApp(kwArgs?:HashMap<any>) {
	app = new WebApplication({
		name: 'Test',
		components: {
			router: null,
			ui: { view: null }
		}
	});

	return app.run().then(function () {
		avatar = new Avatar(lang.mixin(<HashMap<any>>{}, kwArgs, { app: app }));
		app.get('ui').set('view', avatar);
	});
}

function testImage(image:string, shouldSet:boolean = true) {
	if (shouldSet) {
		avatar.set('image', image);
	}

	assert.strictEqual(avatar.get('image'), image,
		'get should return new value of image');

	if (!image) {
		assert.isTrue(avatar.get('firstNode').classList.contains('Avatar-default'),
			'If image is left blank, Avatar should use app icon font');
		assert.strictEqual(avatar.get('firstNode').textContent, 'k',
			'If image is left blank, Avatar should use profile icon from app icon font');
	}
	else if (image.length > 2) {
		assert.notStrictEqual(avatar.get('firstNode').style.backgroundImage.indexOf(image), -1,
			'Widget node\'s background-image style should be set');
	}
	else {
		assert.strictEqual(avatar.get('firstNode').textContent, image,
			'Text in avatar should match what was set');
	}
}

function testConnectionType(connectionType:string, shouldSet:boolean = true) {
	if (shouldSet) {
		avatar.set('connectionType', connectionType);
	}

	var connectionTypeString = eTypeAdapter.toConnectionType(connectionType) || 'none';

	assert.strictEqual(avatar.get('connectionType'), connectionType,
		'get should return new value of connectionType');
	assert.notStrictEqual(
		avatar.get('firstNode').className.indexOf('connection-' + connectionTypeString),
		-1,
		'Widget node should contain connection-' + connectionTypeString + ' class');
}

registerSuite({
	name: 'app/ui/Avatar',

	'get/set tests': {
		beforeEach() {
			return createApp();
		},

		afterEach() {
			app.destroy();
		},

		imageBlank() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			assert.strictEqual(avatar.get('image'), '',
				'image attribute should default to blank');

			testImage('', false);
		},

		imageUrl() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			testImage(imageUrl);
		},

		imageInitials() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			// Run tests twice to confirm that text is properly cleared when resetting
			testImage('KF');
			testImage('NT');
		},

		connectionType() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			assert.strictEqual(avatar.get('connectionType'), '',
				'connectionType attribute should default to empty');
			assert.notStrictEqual(avatar.get('firstNode').className.indexOf('connection-none'), -1,
				'Widget node should contain connection-none class');

			testConnectionType('E');
			testConnectionType('A');
			testConnectionType('M');
			testConnectionType('L');
			testConnectionType('');
		}
	},

	'initialization tests': {
		// Tests in this suite are each responsible for creating their own app/avatar

		afterEach() {
			app.destroy();
		},

		'image URL, connection type unspecified'() {
			return createApp({ image: imageUrl }).then(function () {
				testImage(imageUrl, false);
				testConnectionType('', false);
			});
		},

		'image URL, connection type specified'() {
			return createApp({ image: imageUrl, connectionType: 'E' }).then(function () {
				testImage(imageUrl, false);
				testConnectionType('E', false);
			});
		},

		'image initials, connection type unspecified'() {
			return createApp({ image: 'KF' }).then(function () {
				testImage('KF', false);
				testConnectionType('', false);
			});
		},

		'image initials, connection type specified'() {
			return createApp({ image: 'KF', connectionType: 'A' }).then(function () {
				testImage('KF', false);
				testConnectionType('A', false);
			});
		}
	}
});
