import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import lang = require('dojo/_base/lang');
import app = require('../../ui/app');
import NotificationObserver = require('app/auth/NotificationObserver');
import NotificationManager = require('app/auth/NotificationManager');
import Comment = require('app/models/Comment');
import Message = require('app/models/Message');
import Notification = require('app/models/Notification');

Comment.setDefaultApp(app);
Message.setDefaultApp(app);
Notification.setDefaultApp(app);

var manager:NotificationManager;
var data:HashMap<any>[];

registerSuite({
	name: 'app/auth/NotificationManager',

	'method tests': {
		beforeEach():void {
			manager = setData();
		},

		afterEach():void {
			manager.destroy();
		},

		start():void {
			manager.start();
			assert.isTrue(manager.get('isWatching'),
				'NotificationManager#start should commence listening for changes.');
		},

		stop():void {
			manager.stop();
			assert.isFalse(manager.get('isWatching'),
				'NotificationManager#start should cease listening for changes.');
		},

		add():IPromise<void> {
			var message = new Message({
				id: 23456
			});

			return manager.add({
				id: 12345,
				type: 'message',
				isRead: false,
				item: message
			}).then(function (notification:Notification):void {
				assert.equal(notification.get('type'), 'message');
				assert.equal(notification.get('item'), message);
			});
		}
	},

	'get/set tests': {
		// the following tests are expected to create their own instances of NotificationManager
		startOnInitialize() {
			manager = setData();
			assert.isTrue(manager.get('isWatching'),
				'NotificationManager should listen on initialize.');

			manager = setData({ startOnInitialize: false });
			assert.isFalse(manager.get('isWatching'),
				'NotificationManager should not listen on initialize.');
		},

		observers():void {
			var notifications:{ [key:string]:NotificationObserver } = <any> app.get('notifications');
			manager = setData();

			assert.isTrue((<any> notifications).message instanceof NotificationObserver,
				'app.get(\'newMessages\') should be set.');

			assert.isTrue((<any> notifications).mention instanceof NotificationObserver,
				'app.get(\'newComments\') should be set.');
		}
	}
});

function setData(kwArgs?:HashMap<any>) {
	data = [];
	for (var i = 0; i < 10; i++) {
		data.push({
			id: i,
			isRead: false,
			folderid: 0
		});
	}

	return new NotificationManager(lang.mixin(<HashMap<any>> {}, kwArgs, {
		app: app,
		connectionData: {
			jid: 12345,
			session: 'TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQuIA=='
		}
	}));
}
