define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'dojo/_base/lang', 'app/models/Contact', 'app/viewModels/MasterSearch', 'app/models/stores/Contact', 'app/ui/search/MasterSearch', 'app/util', 'mayhem/WebApplication'], function (require, exports, assert, registerSuite, has, lang, Contact, ContactProxy, ContactStore, MasterSearch, util, WebApplication) {
    var app;
    var search;
    registerSuite({
        name: 'app/ui/MasterSearch',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        searchFiltering: {
            fullName: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                search.set('search', 'Firstname Lastn');
                return testField('displayName', 'Firstname Lastn', 'Full names should match.');
            },
            textCase: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var message = 'The search should ignore the text case of the user input.';
                search.set('search', 'user');
                return testField('displayName', 'user', message, true);
            }
        }
    });
    function getResults(callback) {
        return search.get('searchResults').then(function (contacts) {
            assert.isTrue(!!contacts.length);
            contacts.forEach(callback);
        });
    }
    function testField(name, search, message, ignoreCase) {
        if (message === void 0) { message = ''; }
        if (ignoreCase === void 0) { ignoreCase = false; }
        return getResults(function (contact) {
            var field = contact.get(name);
            if (ignoreCase) {
                field = field.toLowerCase();
            }
            assert.equal(field.indexOf(search), 0, message);
        });
    }
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
        Contact.setDefaultApp(app);
        Contact.setDefaultStore(new ContactStore({ app: app }));
        return app.run().then(function () {
            return app.get('user').login({ username: 'test', password: 'test' }).then(function () {
                return resetStore().then(function () {
                    search = new MasterSearch(lang.mixin({}, kwArgs, {
                        app: app,
                        collection: ContactProxy.forCollection(Contact.store),
                        searchPlaceholder: app.get('i18n').get('messages').searchPlaceholder(),
                    }));
                    app.get('ui').set('view', search);
                });
            });
        });
    }
    function resetStore() {
        return util.removeAll(Contact.store).then(function () {
            var index = 0;
            [
                'Firstname Lastname',
                'User McUserton',
                'Chester Tester',
                'Esther Tester',
                'Lester McTester',
                'Tester McTesterson'
            ].forEach(function (name) {
                var nameParts = name.split(' ');
                Contact.store.put(new Contact({
                    id: index,
                    displayName: name,
                    image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
                }));
                index++;
            });
        });
    }
});
//# sourceMappingURL=MasterSearch.js.map