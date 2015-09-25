import app = require('../app');
import LoginServiceMock = require('../../mocks/Login'); LoginServiceMock;
import Conversation = require('app/models/Conversation');
import ConversationStore = require('app/models/stores/Conversation'); ConversationStore;
import conversationMock = require('../../mocks/showConversation'); conversationMock;
import Message = require('app/models/Message');
import ConversationList = require('app/ui/conversations/ConversationList');
import messageMocks = require('../messages/mockMessageData');
import Promise = require('mayhem/Promise');

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
		]).then(function (items:any[]):void {
			user.set('messages', Message.store);

			var message = items[1][0];
			var conversationList = new ConversationList({
				app:app,
				collection: Conversation.store.filter({ messageId: message.get('id') }),
				message: message
			});
			app.get('ui').set('view', conversationList);
		});
	});
});

export = app;
