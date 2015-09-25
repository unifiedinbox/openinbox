define(["require", "exports", 'intern/chai!assert', 'intern!object', 'dojo/_base/lang', '../../ui/app', 'app/auth/NotificationObserver', 'app/auth/NotificationManager', 'app/models/Comment', 'app/models/Message', 'app/models/Notification'], function (require, exports, assert, registerSuite, lang, app, NotificationObserver, NotificationManager, Comment, Message, Notification) {
    Comment.setDefaultApp(app);
    Message.setDefaultApp(app);
    Notification.setDefaultApp(app);
    var manager;
    var data;
    registerSuite({
        name: 'app/auth/NotificationManager',
        'method tests': {
            beforeEach: function () {
                manager = setData();
            },
            afterEach: function () {
                manager.destroy();
            },
            start: function () {
                manager.start();
                assert.isTrue(manager.get('isWatching'), 'NotificationManager#start should commence listening for changes.');
            },
            stop: function () {
                manager.stop();
                assert.isFalse(manager.get('isWatching'), 'NotificationManager#start should cease listening for changes.');
            },
            add: function () {
                var message = new Message({
                    id: 23456
                });
                return manager.add({
                    id: 12345,
                    type: 'message',
                    isRead: false,
                    item: message
                }).then(function (notification) {
                    assert.equal(notification.get('type'), 'message');
                    assert.equal(notification.get('item'), message);
                });
            }
        },
        'get/set tests': {
            startOnInitialize: function () {
                manager = setData();
                assert.isTrue(manager.get('isWatching'), 'NotificationManager should listen on initialize.');
                manager = setData({ startOnInitialize: false });
                assert.isFalse(manager.get('isWatching'), 'NotificationManager should not listen on initialize.');
            },
            observers: function () {
                var notifications = app.get('notifications');
                manager = setData();
                assert.isTrue(notifications.message instanceof NotificationObserver, 'app.get(\'newMessages\') should be set.');
                assert.isTrue(notifications.mention instanceof NotificationObserver, 'app.get(\'newComments\') should be set.');
            }
        }
    });
    function setData(kwArgs) {
        data = [];
        for (var i = 0; i < 10; i++) {
            data.push({
                id: i,
                isRead: false,
                folderid: 0
            });
        }
        return new NotificationManager(lang.mixin({}, kwArgs, {
            app: app,
            connectionData: {
                jid: 12345,
                session: 'TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQuIA=='
            }
        }));
    }
});
//# sourceMappingURL=NotificationManager.js.map