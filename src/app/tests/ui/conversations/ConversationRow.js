define(["require", "exports", '../app', 'app/models/Conversation', 'app/models/stores/Conversation', '../../mocks/showConversation', 'app/viewModels/ConversationList', '../../mocks/Login', 'app/models/Message', '../messages/mockMessageData', 'dojo/on', 'mayhem/Promise', "mayhem/templating/html!./ConversationRowTestPageTemplate.html"], function (require, exports, app, Conversation, ConversationStore, conversationMocks, ConversationProxy, LoginServiceMock, Message, messageMocks, on, Promise) {
    ConversationStore;
    conversationMocks;
    LoginServiceMock;
    var View = require('mayhem/templating/html!./ConversationRowTestPageTemplate.html');
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
            ]).then(function () {
                Message.get(0).then(function (message) {
                    Conversation.store.filter({ messageId: message.get('id') }).fetch().then(function (conversations) {
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
                            var textarea = (event.target.previousElementSibling);
                            conversationProxy.set('body', textarea.value);
                        });
                    });
                });
            });
        });
    });
    return app;
});
//# sourceMappingURL=ConversationRow.js.map