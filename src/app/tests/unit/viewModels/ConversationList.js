define(["require", "exports", 'intern/chai!assert', 'intern!object', 'mayhem/WebApplication', 'app/endpoints', 'app/models/Contact', 'app/models/Conversation', 'app/viewModels/ConversationList', 'app/models/Message', 'app/models/stores/TrackableMemory'], function (require, exports, assert, registerSuite, WebApplication, endpoints, Contact, Conversation, ConversationProxy, Message, TrackableMemory) {
    var app;
    var message;
    var model;
    var proxy;
    registerSuite({
        name: 'app/viewModels/ConversationList',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        'getters/setters': {
            bcc: function () {
                var expected = model.get('bcc').join(', ');
                assert.equal(proxy.get('bcc'), expected);
            },
            cc: function () {
                var expected = model.get('cc').join(', ');
                assert.equal(proxy.get('cc'), expected);
            },
            to: function () {
                var expected = model.get('to').join(', ');
                assert.equal(proxy.get('to'), expected);
            },
            hasBcc: function () {
                assert.isTrue(proxy.get('hasBcc'));
                model.set('bcc', []);
                assert.isFalse(proxy.get('hasBcc'));
            },
            hasCc: function () {
                assert.isTrue(proxy.get('hasCc'));
                model.set('cc', []);
                assert.isFalse(proxy.get('hasCc'));
            },
            contactImage: function () {
                return proxy.get('contactImage').then(function (image) {
                    assert.equal(image, 'MD');
                });
            },
            message: function () {
                return proxy.get('message').then(function (actual) {
                    assert.equal(actual, message);
                });
            },
            viewSourceLink: function () {
                var expected = endpoints.viewMessageSource + '?messageId=' + model.get('messageId');
                assert.equal(proxy.get('viewSourceLink'), expected);
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
        Contact.setDefaultApp(app);
        Contact.setDefaultStore(new TrackableMemory({ app: app }));
        Conversation.setDefaultApp(app);
        Conversation.setDefaultStore(new TrackableMemory({ app: app }));
        Message.setDefaultApp(app);
        Message.setDefaultStore(new TrackableMemory({ app: app }));
        return app.run().then(function () {
            return setData();
        });
    }
    function setData() {
        Contact.store.put(new Contact({
            displayName: 'Miles Davis',
            image: 'MD'
        }));
        message = new Message({
            id: 23456
        });
        Message.store.put(message);
        return Conversation.store.put(new Conversation({
            bcc: ['Bill Evans', 'Paul Motian'],
            body: 'Pellentesque pellentesque leo a auctor imperdiet. Nam nec hendrerit dolor. Duis fringilla massa at purus mollis pulvinar. Donec sit amet sollicitudin nibh, non lacinia diam. Quisque est eros, tincidunt quis elementum at, ultrices in lacus. Maecenas id tellus nec diam blandit rutrum. Cras in lectus sodales, dapibus ex vitae, eleifend erat. ',
            cc: ['Scott LaFaro'],
            date: new Date(Date.now() * 0.999),
            forwarded: false,
            fromEmail: 'miles.davis@columbia.com',
            fromName: 'Miles Davis',
            id: 123456,
            messageId: 23456,
            replied: false,
            subject: 'Lorem ipsum dolor sit amet.',
            to: ['Keith Jarret', 'Ornette Coleman']
        })).then(function (conversation) {
            model = conversation;
            proxy = new ConversationProxy({
                app: app,
                target: conversation
            });
        });
    }
});
//# sourceMappingURL=ConversationList.js.map