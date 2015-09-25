define(["require", "exports", '../app', 'app/ui/messages/Conversation', 'app/models/Conversation', 'app/models/Message', 'app/tests/ui/messages/mockMessageData', 'app/auth/NotificationObserver', 'mayhem/Promise', '../../mocks/all', "mayhem/templating/html!app/ui/messages/Conversation.html"], function (require, exports, app, Conversation, ConversationModel, Message, mockMessageData, NotificationObserver, Promise, mocks) {
    mocks;
    app.run().then(function () {
        var user = app.get('user');
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
    return app;
});
//# sourceMappingURL=Conversation.js.map