define(["require", "exports", 'dojo/on', '../app', 'app/models/Conversation', 'app/ui/messages/ConversationDialog', '../messages/mockMessageData', 'app/models/Message', 'app/auth/NotificationObserver', 'mayhem/Promise', '../../mocks/all'], function (require, exports, on, app, Conversation, ConversationDialog, mockMessageData, Message, NotificationObserver, Promise, mocks) {
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
    return app;
});
//# sourceMappingURL=ConversationDialog.js.map