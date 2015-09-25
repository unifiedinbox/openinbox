import on = require('dojo/on');
import app = require('../app');
import Conversation = require('app/models/Conversation');
import ConversationDialog = require('app/ui/messages/ConversationDialog');
import mockMessageData = require('../messages/mockMessageData');
import Message = require('app/models/Message');
import NotificationObserver = require('app/auth/NotificationObserver');
import Promise = require('mayhem/Promise');

// comment out this line to disable service mocks
import mocks = require('../../mocks/all'); mocks;

app.run().then(function () {
	var user = <any> app.get('user');

	Promise.all([
		user.login({
			username: 'test',
			password: 'pass'
		}),
		mockMessageData.notifications(),
		mockMessageData.messages()
	]).then(function (promiseData) {
		var newMessages = new NotificationObserver({
			collection: Message.store,
			itemConstructor: Message
		});
		var message = promiseData[2][0];

		newMessages.add(promiseData[1]);
		app.set('notifications', { message: newMessages });

		var dialog = new ConversationDialog({
			app: app,
			message: message,
			collection: Conversation.store
		});
		app.get('ui').set('view', dialog);

		on(document.getElementById('openDialog'), 'click', function () {
			dialog.set('isOpen', true);
		});
	});
});

export = app;
