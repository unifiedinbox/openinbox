import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import WebApplication = require('mayhem/WebApplication');
import app = require('../../ui/app');
import Comment = require('app/models/Comment');
import Notification = require('app/models/Notification');
import NotificationProxy = require('app/viewModels/NotificationList');

// Force any models to use the test app as the default
Comment.setDefaultApp(app);
Notification.setDefaultApp(app);

registerSuite({
	name: 'viewModels/Notification',

	beforeEach():IPromise<WebApplication> {
		return app.run();
	},

	comment():void {
		var notification = createNotification();
		assert.equal(notification.get('comment'), notification.get('item'));
	},

	smartDate():void {
		var now:number = Date.now();
		var smartDate:string = createNotification().get('smartDate');
		var date:Date;

		assert.equal(smartDate, '0m');

		smartDate = createNotification(new Date(now - 120000)).get('smartDate');
		assert.equal(smartDate, '2m');

		smartDate = createNotification(new Date(now - 7200000)).get('smartDate');
		assert.equal(smartDate, '2h');

		smartDate = createNotification(new Date(now - (6 * 86400000))).get('smartDate');
		assert.equal(smartDate, '6d');

		date = new Date(now - (7 * 86400000));
		smartDate = createNotification(date).get('smartDate');
		assert.equal(smartDate, date.toLocaleDateString());
	},

	isRead():void {
		var notification:NotificationProxy = createNotification();
		assert.equal(notification.get('stateClass'), 'is-unread');

		notification.set('isRead', true);
		assert.equal(notification.get('stateClass'), 'is-read');
	}
});

function createNotification(date:Date = new Date()):NotificationProxy {
	var notification = new Notification({ item: new Comment({ date: date }) });
	return new NotificationProxy({
		target: notification
	});
}
