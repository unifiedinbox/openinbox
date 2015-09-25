import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import Promise = require('mayhem/Promise');
import WebApplication = require('mayhem/WebApplication');
import Contact = require('app/models/Contact');
import Comment = require('app/models/Comment');
import Notification = require('app/models/Notification');
import NotificationList = require('app/ui/notifications/NotificationList');
import TrackableMemory = require('app/models/stores/TrackableMemory');

var app:WebApplication;
var notificationList:NotificationList;
var rowNode:HTMLElement;
var unreadCount:number;

registerSuite({
	name: 'app/ui/notifications/NotificationList',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	isRead():IPromise<void> {
		if (!has('host-browser')) {
			this.skip('requires browser');
		}

		var unread = Notification.store.filter({ isRead: false });
		return unread.fetch().then(function (notifications:Notification[]):void {
			assert.equal(notifications.length, unreadCount, 'All notifications should be unread by default.');
		});
	},

	markAllAsRead():IPromise<void> {
		if (!has('host-browser')) {
			this.skip('requires browser');
		}

		return notificationList.markAllAsRead().then(function () {
			var filtered = Notification.store.filter({ isRead: false });
			return filtered.fetch().then(function (notifications:Notification[]):void {
				assert.equal(notifications.length, 0, 'markAllAsRead should mark all notifications as read.');
			});
		});
	},

	'notification rows': {
		beforeEach():void {
			rowNode = <HTMLElement> notificationList.get('firstNode').querySelector('.Notification');
		},

		smartDate():void {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var node = <HTMLElement> rowNode.querySelector('.Notification-date');
			assert.equal(node.textContent, '0m',
				'The notification row should display the sent date.');
		}
	}
});

function createApp(kwArgs?:HashMap<any>):IPromise<void> {
	app = new WebApplication({
		name: 'Test',
		components: {
			i18n: { preload: [ 'app/nls/main' ] },
			router: null,
			ui: { view: null }
		}
	});

	Notification.setDefaultApp(app);
	Notification.setDefaultStore(<any> new TrackableMemory());
	Contact.setDefaultApp(app);
	Contact.setDefaultStore(<any> new TrackableMemory());
	Comment.setDefaultApp(app);

	return resetData().then(function () {
		return app.run();
	}).then(function () {
		notificationList = new NotificationList(lang.mixin(<HashMap<any>>{}, kwArgs, {
			app: app,
			collection: Notification.store
		}));
		app.get('ui').set('view', notificationList);
	});
}

function resetData():IPromise<Notification[]> {
	var message:string = 'Bacon ipsum dolor amet porchetta cow capicola pork belly \
	beef ribs short ribs ribeye shoulder swine tail. Strip steak cupim drumstick, \
	salami rump t-bone biltong jowl pork loin andouille porchetta fatback. Porchetta \
	picanha tenderloin bacon. Picanha sausage spare ribs meatloaf, sirloin pastrami \
	turducken hamburger. Alcatra drumstick short loin turkey andouille spare ribs \
	kevin pastrami sirloin tongue turducken.';

	[
		'Ken Franqueiro',
		'James Donaghue',
		'Matt Wistrand',
		'Nita Tune',
		'Torrey Rice'
	].forEach(function (name:string, index:number):void {
		var nameParts = name.split(' ');

		Contact.store.put(new Contact({
			id: index,
			displayName: name,
			image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
		}));
	});

	var promises:IPromise<Notification>[] = [];
	unreadCount = 0;
	while (unreadCount < 10) {
		promises.push(Contact.get(Math.floor(unreadCount / 2))
			.then(function (contact:Contact):IPromise<Notification> {
				return Notification.store.put(new Notification({
					id: unreadCount,
					item: new Comment({
						contact: contact,
						message: message
					})
				}));
			}));

		unreadCount += 1;
	}

	return Promise.all(promises);
}
