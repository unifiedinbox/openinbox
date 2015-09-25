/// <amd-dependency path="mayhem/templating/html!app/ui/messages/Conversation.html" />

import app = require('../app');
import Conversation = require('app/ui/messages/Conversation');
import ConversationModel = require('app/models/Conversation');
import Message = require('app/models/Message');
import mockMessageData = require('app/tests/ui/messages/mockMessageData');
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

		app.get('ui').set('view', new Conversation({
			app: app,
			message: message,
			collection: ConversationModel.store,
			notifications: newMessages
		}));
	});
});

export = app;
