import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import WebApplication = require('mayhem/WebApplication');
import Message = require('app/models/Message');
import MessageList = require('app/ui/messages/MessageList');
import MessageStore = require('app/models/stores/Message');

var app:WebApplication;
var messageList:MessageList;

// comment out this line to disable service mocks
import mocks = require('../../../mocks/all'); mocks;

registerSuite({
	name: 'app/ui/messages/MessageList',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	totalLength():void {
		if (!has('host-browser')) {
			this.skip('requires browser');
		}

		var dfd = this.async(100);

		setTimeout(dfd.callback(function () {
			assert.equal(messageList.get('totalLength'), 100);
		}), 100);
	}
});

function createApp(kwArgs?:HashMap<any>):IPromise<void> {
	app = new WebApplication({
		name: 'Test',
		components: {
			i18n: { preload: [ 'app/nls/main' ] },
			router: null,
			ui: { view: null },
			user: {
				constructor: 'app/auth/User'
			}
		}
	});

	Message.setDefaultApp(app);
	Message.setDefaultStore(<any> new MessageStore({ app: app }));

	return app.run().then(function () {
		messageList = new MessageList({
			app: app,
			collection: Message.store
		});

		app.get('ui').set('view', messageList);
	});
}
