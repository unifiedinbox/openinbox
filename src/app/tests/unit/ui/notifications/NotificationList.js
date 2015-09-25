define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'dojo/_base/lang', 'mayhem/Promise', 'mayhem/WebApplication', 'app/models/Contact', 'app/models/Comment', 'app/models/Notification', 'app/ui/notifications/NotificationList', 'app/models/stores/TrackableMemory'], function (require, exports, assert, registerSuite, has, lang, Promise, WebApplication, Contact, Comment, Notification, NotificationList, TrackableMemory) {
    var app;
    var notificationList;
    var rowNode;
    var unreadCount;
    registerSuite({
        name: 'app/ui/notifications/NotificationList',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        isRead: function () {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }
            var unread = Notification.store.filter({ isRead: false });
            return unread.fetch().then(function (notifications) {
                assert.equal(notifications.length, unreadCount, 'All notifications should be unread by default.');
            });
        },
        markAllAsRead: function () {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }
            return notificationList.markAllAsRead().then(function () {
                var filtered = Notification.store.filter({ isRead: false });
                return filtered.fetch().then(function (notifications) {
                    assert.equal(notifications.length, 0, 'markAllAsRead should mark all notifications as read.');
                });
            });
        },
        'notification rows': {
            beforeEach: function () {
                rowNode = notificationList.get('firstNode').querySelector('.Notification');
            },
            smartDate: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var node = rowNode.querySelector('.Notification-date');
                assert.equal(node.textContent, '0m', 'The notification row should display the sent date.');
            }
        }
    });
    function createApp(kwArgs) {
        app = new WebApplication({
            name: 'Test',
            components: {
                i18n: { preload: ['app/nls/main'] },
                router: null,
                ui: { view: null }
            }
        });
        Notification.setDefaultApp(app);
        Notification.setDefaultStore(new TrackableMemory());
        Contact.setDefaultApp(app);
        Contact.setDefaultStore(new TrackableMemory());
        Comment.setDefaultApp(app);
        return resetData().then(function () {
            return app.run();
        }).then(function () {
            notificationList = new NotificationList(lang.mixin({}, kwArgs, {
                app: app,
                collection: Notification.store
            }));
            app.get('ui').set('view', notificationList);
        });
    }
    function resetData() {
        var message = 'Bacon ipsum dolor amet porchetta cow capicola pork belly \
	beef ribs short ribs ribeye shoulder swine tail. Strip steak cupim drumstick, \
	salami rump t-bone biltong jowl pork loin andouille porchetta fatback. Porchetta \
	picanha tenderloin bacon. Picanha sausage spare ribs meatloaf, sirloin pastrami \
	turducken hamburger. Alcatra drumstick short loin turkey andouille spare ribs \
	kevin pastrami sirloin tongue turducken.';
        [
            'Ken Franqueiro',
            'James Donaghue',
            'Matt Wistrand',
            'Nita Tune',
            'Torrey Rice'
        ].forEach(function (name, index) {
            var nameParts = name.split(' ');
            Contact.store.put(new Contact({
                id: index,
                displayName: name,
                image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
            }));
        });
        var promises = [];
        unreadCount = 0;
        while (unreadCount < 10) {
            promises.push(Contact.get(Math.floor(unreadCount / 2)).then(function (contact) {
                return Notification.store.put(new Notification({
                    id: unreadCount,
                    item: new Comment({
                        contact: contact,
                        message: message
                    })
                }));
            }));
            unreadCount += 1;
        }
        return Promise.all(promises);
    }
});
//# sourceMappingURL=NotificationList.js.map