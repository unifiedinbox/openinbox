define(["require", "exports", 'mayhem/Promise', 'mayhem/WebApplication', 'intern/chai!assert', 'app/models/Contact', 'app/models/stores/Contact', '../../../mocks/getContactsList', '../../../mocks/data/getContactsList', 'intern!object'], function (require, exports, Promise, WebApplication, assert, Contact, ContactStore, contactsMock, mockData, registerSuite) {
    ContactStore;
    contactsMock;
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
                Contact.setDefaultApp(app);
                Contact.setDefaultStore(new ContactStore({ app: app }));
            });
        });
    }
    registerSuite({
        name: 'app/models/stores/Contacts',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        'fetch': function () {
            var results = Contact.store.fetch();
            return Promise.all([
                results.then(function (results) {
                    assert.strictEqual(results.length, mockData.length, 'Total length of results should be 2');
                    results.forEach(function (result, i) {
                        var mock = mockData[i];
                        assert.strictEqual(result.get('id'), mock.intIndx, 'Result\'s id should match mock data');
                        assert.strictEqual(result.get('displayName'), mock.name, 'Result\'s displayName should match mock data');
                        assert.strictEqual(result.get('image'), mock.imagepath, 'Result\'s image should match mock data');
                    });
                }),
                results.totalLength.then(function (total) {
                    assert.strictEqual(total, mockData.length, 'Reported totalLength should be 2');
                })
            ]);
        }
    });
});
//# sourceMappingURL=Contact.js.map