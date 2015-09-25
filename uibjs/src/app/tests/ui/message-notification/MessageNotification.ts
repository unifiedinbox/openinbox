/// <amd-dependency path="mayhem/templating/html!app/tests/ui/message-notification/NewMessagesTemplate.html" />

import app = require('../app');
import Message = require('app/models/Message');
import mocks = require('../messages/mockMessageData');
import Notification = require('app/models/Notification');
import NotificationObserver = require('app/auth/NotificationObserver');
import on = require('dojo/on');
import BaseView = require('mayhem/ui/View');

var View:{
	new (kwArgs?:{}):View;
	prototype:View;
};
interface View extends BaseView {}
View = require<typeof View>('mayhem/templating/html!app/tests/ui/message-notification/NewMessagesTemplate.html');

app.run().then(function () {
	mocks.notifications().then(function (notifications:Notification[]):void {
		var newMessages = new NotificationObserver({
			collection: Message.store,
			itemConstructor: Message
		});
		newMessages.add(notifications);
		app.set('notifications', { message: newMessages });

		var view = new View({ app: app });
		app.get('ui').set('view', view);

		var lastIndex = 10;
		on(document.getElementById('addNewEmail'), 'click', function () {
			var id = ++lastIndex;
			newMessages.add(new Notification({
				id: id,
				item: new Message({ isRead: false, id: 'email-' + id, connectionType: 'E' })
			}));
		});
	});
});

export = app;
