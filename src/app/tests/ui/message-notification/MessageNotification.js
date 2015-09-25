define(["require", "exports", '../app', 'app/models/Message', '../messages/mockMessageData', 'app/models/Notification', 'app/auth/NotificationObserver', 'dojo/on', "mayhem/templating/html!app/tests/ui/message-notification/NewMessagesTemplate.html"], function (require, exports, app, Message, mocks, Notification, NotificationObserver, on) {
    var View;
    View = require('mayhem/templating/html!app/tests/ui/message-notification/NewMessagesTemplate.html');
    app.run().then(function () {
        mocks.notifications().then(function (notifications) {
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
    return app;
});
//# sourceMappingURL=MessageNotification.js.map