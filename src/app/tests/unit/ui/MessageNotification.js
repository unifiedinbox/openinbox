define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'dojo/_base/lang', 'mayhem/WebApplication', 'app/models/adapters/eType', 'app/models/Message', 'app/models/stores/Message', 'app/models/Notification', 'app/auth/NotificationObserver', 'app/ui/MessageNotification'], function (require, exports, assert, registerSuite, has, lang, WebApplication, eTypeAdapter, Message, MessageStore, Notification, NotificationObserver, MessageNotification) {
    var app;
    var notification;
    var newMessages;
    var mostRecentId;
    registerSuite({
        name: 'app/ui/MessageNotification',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        state: function () {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }
            notification.set('state', 'hidden');
            assertState('hidden');
            notification.set('state', 'displayed');
            assertState('displayed');
        },
        total: function () {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }
            var before = notification.get('total');
            var after;
            addMessage();
            after = notification.get('total');
            assert.equal(after, before + 1);
        },
        rendering: function () {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }
            assertState('hidden');
            eTypeAdapter.forEachConnectionType(function (type) {
                assertState('hidden', type);
            });
        },
        bindings: {
            displayCounts: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var node = notification.get('firstNode');
                var emailNode = node.querySelector('.connection-email');
                var totalNode = node.querySelector('.MessageNotification-total');
                var dfd = this.async(100);
                addMessage();
                setTimeout(dfd.callback(function () {
                    var emailCount = newMessages.get('queue').reduce(function (i, notification) {
                        var item = notification.get('item');
                        return (item.get('connectionType') === 'E') ? i + 1 : i;
                    }, 0);
                    assert.equal(Number(emailNode.firstChild.nodeValue), emailCount, 'Displayed e-mail count');
                    assert.equal(parseInt(totalNode.firstChild.nodeValue, 10), notification.get('total'), 'Displayed total count');
                    eTypeAdapter.forEachConnectionType(function (type) {
                        if (type !== 'email') {
                            assertState('hidden', type);
                        }
                    });
                }), 100);
            },
            addMessage: function () {
                var dfd = this.async(100);
                addMessage();
                setTimeout(dfd.callback(function () {
                    assertState('displayed');
                }), 100);
            },
            removeMessage: {
                nonZero: function () {
                    addMessage();
                    return newMessages.commit().then(function () {
                        assertState('hidden');
                        assertState('hidden', 'email');
                    });
                }
            }
        }
    });
    function assertState(state, type) {
        if (state === void 0) { state = 'hidden'; }
        var node = notification.get('firstNode');
        var testNode = type ? node.querySelector('.connection-' + type) : node;
        var isHidden = testNode.classList.contains('is-hidden');
        var expected = state === 'hidden';
        assert.strictEqual(isHidden, expected, 'Node should' + (expected ? '' : ' not') + ' be hidden');
    }
    function createApp(kwArgs) {
        app = new WebApplication({
            name: 'Test',
            components: {
                i18n: { preload: ['app/nls/main'] },
                router: null,
                ui: { view: null }
            }
        });
        Message.setDefaultApp(app);
        Message.setDefaultStore(new MessageStore({ app: 'app/main' }));
        Notification.setDefaultApp(app);
        return app.run().then(function () {
            mostRecentId = 0;
            newMessages = new NotificationObserver({
                collection: Message.store,
                itemConstructor: Message
            });
            notification = new MessageNotification(lang.mixin({}, kwArgs, {
                app: app,
                notifications: newMessages
            }));
            app.get('ui').set('view', notification);
        });
    }
    function addMessage() {
        var id = ++mostRecentId;
        newMessages.add(new Notification({
            id: id,
            type: 'message',
            item: new Message({
                connectionType: 'E',
                id: id
            })
        }));
    }
});
//# sourceMappingURL=MessageNotification.js.map