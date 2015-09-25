define(["require", "exports", 'intern/chai!assert', 'app/models/Attachment', 'app/models/stores/Attachment', '../../../mocks/Attachment', '../../../mocks/data/Attachment', 'mayhem/Promise', 'intern!object', 'mayhem/WebApplication'], function (require, exports, assert, Attachment, AttachmentStore, attachmentMock, mockData, Promise, registerSuite, WebApplication) {
    AttachmentStore;
    attachmentMock;
    var app;
    function createApp() {
        app = new WebApplication({
            apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT',
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
        return app.run().then(function () {
            return app.get('user').login({ username: 'test', password: 'test' }).then(function () {
                Attachment.setDefaultApp(app);
                Attachment.setDefaultStore(new AttachmentStore({ app: app }));
            });
        });
    }
    registerSuite({
        name: 'app/models/stores/Attachment',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        'filter': function () {
            var results = Attachment.store.filter({ messageId: 10 }).fetch();
            return Promise.all([
                results.then(function (results) {
                    assert.isDefined(results, 'Results should be defined');
                    assert.strictEqual(results.length, mockData.length, 'Total length of results should be 2');
                    results.forEach(function (result, i) {
                        var mock = mockData[i];
                        assert.strictEqual(result.get('name'), mock.name, 'Result\'s name should match mock data');
                        assert.strictEqual(result.get('type'), mock.type, 'Result\'s type should match mock data');
                        assert.strictEqual(result.get('size'), mock.size, 'Result\'s size should match mock data');
                    });
                }),
                results.totalLength.then(function (total) {
                    assert.strictEqual(total, mockData.length, 'Reported totalLength should be 2');
                })
            ]);
        }
    });
});
//# sourceMappingURL=Attachment.js.map