define(["require", "exports", '../app', '../../mocks/Login', 'app/models/Conversation', 'app/models/stores/Conversation', '../../mocks/showConversation', 'app/models/Message', 'app/ui/conversations/ConversationList', '../messages/mockMessageData', 'mayhem/Promise'], function (require, exports, app, LoginServiceMock, Conversation, ConversationStore, conversationMock, Message, ConversationList, messageMocks, Promise) {
    LoginServiceMock;
    ConversationStore;
    conversationMock;
    app.run().then(function () {
        Conversation.setDefaultApp(app);
        Conversation.store.app = app;
        var user = app.get('user');
        user.login({
            username: 'test',
            password: 'pass'
        }).then(function () {
            Promise.all([
                messageMocks.contacts(),
                messageMocks.messages()
            ]).then(function (items) {
                user.set('messages', Message.store);
                var message = items[1][0];
                var conversationList = new ConversationList({
                    app: app,
                    collection: Conversation.store.filter({ messageId: message.get('id') }),
                    message: message
                });
                app.get('ui').set('view', conversationList);
            });
        });
    });
    return app;
});
//# sourceMappingURL=ConversationList.js.map