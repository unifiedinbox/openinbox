import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import WebApplication = require('mayhem/WebApplication');

import eTypeAdapter = require('app/models/adapters/eType');
import Message = require('app/models/Message');
import MessageStore = require('app/models/stores/Message');
import Notification = require('app/models/Notification');
import NotificationObserver = require('app/auth/NotificationObserver');
import MessageNotification = require('app/ui/MessageNotification');

var app:WebApplication;
var notification:MessageNotification;
var newMessages:NotificationObserver;
var mostRecentId:number;

registerSuite({
	name: 'app/ui/MessageNotification',

	beforeEach() {
		return createApp();
	},

	afterEach() {
		app.destroy();
	},

	state() {
		if (!has('host-browser')) {
			this.skip('requires browser');
		}

		notification.set('state', 'hidden');
		assertState('hidden');

		notification.set('state', 'displayed');
		assertState('displayed');
	},

	total() {
		if (!has('host-browser')) {
			this.skip('requires browser');
		}

		var before:number = notification.get('total');
		var after:number;

		addMessage();
		after = notification.get('total');
		assert.equal(after, before + 1);
	},

	rendering() {
		if (!has('host-browser')) {
			this.skip('requires browser');
		}

		assertState('hidden');
		eTypeAdapter.forEachConnectionType(function (type:string):void {
			assertState('hidden', type);
		});
	},

	bindings: {
		displayCounts() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var node = <HTMLElement> notification.get('firstNode');
			var emailNode = node.querySelector('.connection-email');
			var totalNode = node.querySelector('.MessageNotification-total');
			var dfd = this.async(100);

			addMessage();
			setTimeout(dfd.callback(function () {
				var emailCount:number = newMessages.get('queue').reduce((i:number, notification:Notification) => {
					var item:Message = <any> notification.get('item');

					return ((<any> item.get('connectionType')) === 'E') ? i + 1 : i;
				}, 0);

				assert.equal(Number(emailNode.firstChild.nodeValue), emailCount, 'Displayed e-mail count');
				assert.equal(parseInt(totalNode.firstChild.nodeValue, 10), notification.get('total'),
					'Displayed total count');

				eTypeAdapter.forEachConnectionType(function (type:string):void {
					if (type !== 'email') {
						assertState('hidden', type);
					}
				});
			}), 100);
		},

		addMessage() {
			var dfd = this.async(100);

			addMessage();
			setTimeout(dfd.callback(function () {
				assertState('displayed');
			}), 100);
		},

		removeMessage: {
			nonZero() {
				addMessage();
				return newMessages.commit().then(function ():void {
					assertState('hidden');
					assertState('hidden', 'email');
				});
			}
		}
	}
});

function assertState(state:string = 'hidden', type?:string):void {
	var node = notification.get('firstNode');
	var testNode = type ? node.querySelector('.connection-' + type) : node;
	var isHidden:boolean = (<HTMLElement> testNode).classList.contains('is-hidden');
	var expected:boolean = state === 'hidden';
	assert.strictEqual(isHidden, expected, 'Node should' + (expected ? '' : ' not') + ' be hidden');
}

function createApp(kwArgs?:HashMap<any>):IPromise<void> {
	app = new WebApplication({
		name: 'Test',
		components: {
			i18n: { preload: [ 'app/nls/main' ] },
			router: null,
			ui: { view: null }
		}
	});

	Message.setDefaultApp(app);
	Message.setDefaultStore(new MessageStore({ app: 'app/main' }));
	Notification.setDefaultApp(app);

	return app.run().then(function () {
		mostRecentId = 0;
		newMessages = new NotificationObserver({
			collection: Message.store,
			itemConstructor: Message
		});

		notification = new MessageNotification(lang.mixin(<HashMap<any>>{}, kwArgs, {
			app: app,
			notifications: newMessages
		}));
		app.get('ui').set('view', notification);
	});
}

function addMessage():void {
	var id = ++mostRecentId;

	newMessages.add(new Notification({
		id: id,
		type: 'message',
		item: new Message({
			connectionType: 'E',
			id: id
		})
	}));
}
