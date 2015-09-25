/// <amd-dependency path="mayhem/templating/html!./ConversationRowTestPageTemplate.html" />

import app = require('../app');
import Conversation = require('app/models/Conversation');
import ConversationStore = require('app/models/stores/Conversation'); ConversationStore;
import conversationMocks = require('../../mocks/showConversation'); conversationMocks;
import ConversationProxy = require('app/viewModels/ConversationList');
import LoginServiceMock = require('../../mocks/Login'); LoginServiceMock;
import Message = require('app/models/Message');
import messageMocks = require('../messages/mockMessageData');
import on = require('dojo/on');
import Promise = require('mayhem/Promise');

var View = require<any>('mayhem/templating/html!./ConversationRowTestPageTemplate.html');

app.run().then(function ():void {
	Conversation.setDefaultApp(app);
	(<any> Conversation.store).app = app;
	var user = <any> app.get('user');
	user.login({
		username: 'test',
		password: 'pass'
	}).then(function () {
		Promise.all([
			messageMocks.contacts(),
			messageMocks.messages()
		]).then(function () {
			Message.get(0).then(function (message:Message):void {
				Conversation.store.filter({ messageId: message.get('id') }).fetch().then(function (conversations:Conversation[]) {
					var conversationProxy = new ConversationProxy({
						target: conversations[0],
						message: message
					});

					var view = new View({
						app: app,
						model: conversationProxy
					});
					app.get('ui').set('view', view);

					on(document.getElementById('setBody'), 'click', function () {
						var textarea = <HTMLTextAreaElement> ((<HTMLElement> event.target).previousElementSibling);
						conversationProxy.set('body', textarea.value);
					});
				});
			});
		});
	});
});

export = app;
