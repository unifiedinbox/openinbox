import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import Promise = require('mayhem/Promise');
import WebApplication = require('mayhem/WebApplication');
import Notification = require('app/models/Notification');
import NotificationLabel = require('app/ui/notifications/NotificationLabel');
import TrackableMemory = require('app/models/stores/TrackableMemory');

var app:WebApplication;
var label:NotificationLabel<any>;
var unreadCount:number;

registerSuite({
	name: 'app/ui/notifications/NotificationLabel',

	'get/set tests': {
		beforeEach():IPromise<void> {
			return createApp();
		},

		afterEach():void {
			app.destroy();
		},

		unreadCount():IPromise<void> {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var node = <HTMLElement> label.get('firstNode').querySelector('span');
			assert.equal(node.firstChild.nodeValue, String(unreadCount),
				'The notification count should match the store count.');

			return Notification.store.add(new Notification({
				id: unreadCount + 1,
				isRead: false
			})).then(function (notification:Notification):IPromise<void> {
				assert.equal(node.firstChild.nodeValue, String(unreadCount + 1),
					'The notification count should match the store count.');

				return Notification.store.remove(unreadCount + 1).then(function () {
					assert.equal(node.firstChild.nodeValue, String(unreadCount),
						'The notification count should match the store count.');

					label.set('notificationCount', 0);
					assert.isTrue(node.classList.contains('is-hidden'),
						'The count node should be hidden when the count is zero.');
				});
			});
		}
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
				constructor: 'mayhem/auth/User'
			}
		}
	});

	Notification.setDefaultApp(app);
	Notification.setDefaultStore(<any> new TrackableMemory());

	return resetData().then(function () {
		return app.run();
	}).then(function () {
		label = new NotificationLabel(lang.mixin(<HashMap<any>>{}, kwArgs, {
			app: app,
			collection: Notification.store
		}));
		app.get('ui').set('view', label);
	});
}

function resetData():IPromise<Notification[]> {
	var promises:IPromise<Notification>[] = [];
	unreadCount = 0;
	while (unreadCount < 10) {
		promises.push(Notification.store.put(new Notification({
			id: unreadCount
		})));
		unreadCount += 1;
	}

	return Promise.all(promises);
}
