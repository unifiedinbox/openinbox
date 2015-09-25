define(["require", "exports", 'intern/chai!assert', 'intern!object', '../../ui/app', 'app/models/Comment', 'app/models/Notification', 'app/viewModels/NotificationList'], function (require, exports, assert, registerSuite, app, Comment, Notification, NotificationProxy) {
    Comment.setDefaultApp(app);
    Notification.setDefaultApp(app);
    registerSuite({
        name: 'viewModels/Notification',
        beforeEach: function () {
            return app.run();
        },
        comment: function () {
            var notification = createNotification();
            assert.equal(notification.get('comment'), notification.get('item'));
        },
        smartDate: function () {
            var now = Date.now();
            var smartDate = createNotification().get('smartDate');
            var date;
            assert.equal(smartDate, '0m');
            smartDate = createNotification(new Date(now - 120000)).get('smartDate');
            assert.equal(smartDate, '2m');
            smartDate = createNotification(new Date(now - 7200000)).get('smartDate');
            assert.equal(smartDate, '2h');
            smartDate = createNotification(new Date(now - (6 * 86400000))).get('smartDate');
            assert.equal(smartDate, '6d');
            date = new Date(now - (7 * 86400000));
            smartDate = createNotification(date).get('smartDate');
            assert.equal(smartDate, date.toLocaleDateString());
        },
        isRead: function () {
            var notification = createNotification();
            assert.equal(notification.get('stateClass'), 'is-unread');
            notification.set('isRead', true);
            assert.equal(notification.get('stateClass'), 'is-read');
        }
    });
    function createNotification(date) {
        if (date === void 0) { date = new Date(); }
        var notification = new Notification({ item: new Comment({ date: date }) });
        return new NotificationProxy({
            target: notification
        });
    }
});
//# sourceMappingURL=NotificationList.js.map