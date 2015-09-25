define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'mayhem/WebApplication', 'app/models/Message', 'app/ui/messages/MessageList', 'app/models/stores/Message', '../../../mocks/all'], function (require, exports, assert, registerSuite, has, WebApplication, Message, MessageList, MessageStore, mocks) {
    var app;
    var messageList;
    mocks;
    registerSuite({
        name: 'app/ui/messages/MessageList',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        totalLength: function () {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }
            var dfd = this.async(100);
            setTimeout(dfd.callback(function () {
                assert.equal(messageList.get('totalLength'), 100);
            }), 100);
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
                    constructor: 'app/auth/User'
                }
            }
        });
        Message.setDefaultApp(app);
        Message.setDefaultStore(new MessageStore({ app: app }));
        return app.run().then(function () {
            messageList = new MessageList({
                app: app,
                collection: Message.store
            });
            app.get('ui').set('view', messageList);
        });
    }
});
//# sourceMappingURL=MessageList.js.map