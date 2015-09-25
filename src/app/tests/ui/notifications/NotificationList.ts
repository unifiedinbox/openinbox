/// <amd-dependency path="mayhem/templating/html!app/tests/ui/notifications/ListTemplate.html" />

import app = require('../app');
import Comment = require('app/models/Comment');
import Contact = require('app/models/Contact');
import Notification = require('app/models/Notification');
import Promise = require('mayhem/Promise');
import Session = require('app/auth/Session');
import User = require('mayhem/auth/User');
import View = require('mayhem/ui/View');
import mocks = require('../../mocks/all'); mocks;

// This module needs to be loaded so that it will set the default store on app/models/Contact
import ContactStore = require('app/models/stores/Contact'); ContactStore;

var AppView:{
	new (kwArgs?:{}):AppView;
	prototype:AppView;
};
interface AppView extends View {}
AppView = require<typeof AppView>('mayhem/templating/html!app/tests/ui/notifications/ListTemplate.html');

Comment.setDefaultApp(app);
Contact.setDefaultApp(app);
Notification.setDefaultApp(app);

app.run().then(function () {
	var unreadCount = 0;
	var message:string = 'Bacon ipsum dolor amet porchetta cow capicola pork belly \
	beef ribs short ribs ribeye shoulder swine tail. Strip steak cupim drumstick, \
	salami rump t-bone biltong jowl pork loin andouille porchetta fatback. Porchetta \
	picanha tenderloin bacon. Picanha sausage spare ribs meatloaf, sirloin pastrami \
	turducken hamburger. Alcatra drumstick short loin turkey andouille spare ribs \
	kevin pastrami sirloin tongue turducken.';

	var promises:IPromise<Notification>[] = [];

	(<any> Contact.store).app = app;

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
			firstName: nameParts[0],
			lastName: nameParts[1],
			email: (nameParts[0].charAt(0) + nameParts[1]).toLowerCase() + '@sitepen.com',
			image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
		}));
	});

	while (unreadCount < 10) {
		promises.push(Contact.get(Math.floor(unreadCount / 2))
			.then(function (contact:Contact):IPromise<Notification> {
				return Notification.store.put(new Notification({
					id: unreadCount,
					type: 'mention',
					item: new Comment({
						contact: contact,
						message: message
					})
				}));
			}));

		unreadCount += 1;
	}

	Promise.all(promises).then(function ():void {
		app.set('user', new User({
			mentions: Notification.store.filter({ type: 'mention' }),
			session: new Session({ userId: 12345 })
		}));

		var appView = new AppView({ app: app });

		appView.on('notification-selected', function (event) {
			var comment = event.target.get('model').get('item');
			console.log('notification-selected event triggered for comment by ' + comment.get('contact').get('displayName'));
		});

		app.get('ui').set('view', appView);
	});
});

export = app;
