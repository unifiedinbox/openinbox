define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'dojo/_base/lang', 'mayhem/Promise', 'mayhem/WebApplication', 'app/models/Notification', 'app/ui/notifications/NotificationLabel', 'app/models/stores/TrackableMemory'], function (require, exports, assert, registerSuite, has, lang, Promise, WebApplication, Notification, NotificationLabel, TrackableMemory) {
    var app;
    var label;
    var unreadCount;
    registerSuite({
        name: 'app/ui/notifications/NotificationLabel',
        'get/set tests': {
            beforeEach: function () {
                return createApp();
            },
            afterEach: function () {
                app.destroy();
            },
            unreadCount: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var node = label.get('firstNode').querySelector('span');
                assert.equal(node.firstChild.nodeValue, String(unreadCount), 'The notification count should match the store count.');
                return Notification.store.add(new Notification({
                    id: unreadCount + 1,
                    isRead: false
                })).then(function (notification) {
                    assert.equal(node.firstChild.nodeValue, String(unreadCount + 1), 'The notification count should match the store count.');
                    return Notification.store.remove(unreadCount + 1).then(function () {
                        assert.equal(node.firstChild.nodeValue, String(unreadCount), 'The notification count should match the store count.');
                        label.set('notificationCount', 0);
                        assert.isTrue(node.classList.contains('is-hidden'), 'The count node should be hidden when the count is zero.');
                    });
                });
            }
        }
    });
    function createApp(kwArgs) {
        app = new WebApplication({
            name: 'Test',
            components: {
                i18n: { preload: ['app/nls/main'] },
                router: null,
                ui: { view: null },
                user: {
                    constructor: 'mayhem/auth/User'
                }
            }
        });
        Notification.setDefaultApp(app);
        Notification.setDefaultStore(new TrackableMemory());
        return resetData().then(function () {
            return app.run();
        }).then(function () {
            label = new NotificationLabel(lang.mixin({}, kwArgs, {
                app: app,
                collection: Notification.store
            }));
            app.get('ui').set('view', label);
        });
    }
    function resetData() {
        var promises = [];
        unreadCount = 0;
        while (unreadCount < 10) {
            promises.push(Notification.store.put(new Notification({
                id: unreadCount
            })));
            unreadCount += 1;
        }
        return Promise.all(promises);
    }
});
//# sourceMappingURL=NotificationLabel.js.map