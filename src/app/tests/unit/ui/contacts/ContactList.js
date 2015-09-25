define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'dojo/_base/lang', 'mayhem/Promise', 'mayhem/WebApplication', 'app/ui/contacts/ContactList', 'app/models/Contact', 'app/models/stores/Contact', 'app/models/adapters/eType', 'app/util'], function (require, exports, assert, registerSuite, has, lang, Promise, WebApplication, ContactList, Contact, ContactStore, eTypeAdapter, util) {
    ContactStore;
    var app;
    var contactList;
    function createApp(kwArgs) {
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
                return util.removeAll(Contact.store).then(function () {
                    contactList = new ContactList(lang.mixin({ app: app, collection: Contact.store }, kwArgs));
                    app.get('ui').set('view', contactList);
                });
            });
        });
    }
    var imageUrl = 'https://avatars0.githubusercontent.com/u/78551?v=3&s=460';
    function createContact(kwArgs) {
        return new Contact(lang.mixin({}, {
            id: 1,
            displayName: 'Bob Smith',
            image: imageUrl,
            accounts: [{ eType: 'E' }, { eType: 'M' }]
        }, kwArgs));
    }
    function testConnectionType(contactList, connectionType) {
        return Contact.store.add(createContact({
            accounts: connectionType ? [{ eType: connectionType }] : [],
            app: contactList.get('app')
        })).then(function () {
            if (connectionType) {
                var connectionTypeString = eTypeAdapter.toConnectionType(connectionType);
                assert.notStrictEqual(contactList.get('firstNode').querySelector('.connection-types > span').className.indexOf('connection-' + connectionTypeString), -1, 'Widget node should contain connection-' + connectionTypeString + ' class');
            }
            else {
                assert.isNull(contactList.get('firstNode').querySelector('.connection-types > span'));
            }
        });
    }
    function testSearch(search) {
        contactList.set('search', search);
        return contactList.get('listView').get('collection').fetch().then(function (storeItems) {
            var storeValues = storeItems.map(function (contact) { return contact.get('displayName'); });
            var domNodes = contactList.get('firstNode').querySelectorAll('.dgrid-row');
            var uiValues = Array.prototype.slice.apply(domNodes).map(function (node) { return node.textContent; });
            assert.sameMembers(uiValues, storeValues);
        });
    }
    registerSuite({
        name: 'app/ui/contacts/ContactList',
        'get/set tests': {
            beforeEach: function () {
                return createApp();
            },
            afterEach: function () {
                return util.removeAll(Contact.store).then(function () {
                    app.destroy();
                });
            },
            connectionTypeNone: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                return testConnectionType(contactList, null);
            },
            connectionTypeEmail: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                return testConnectionType(contactList, 'E');
            },
            connectionTypeFacebook: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                return testConnectionType(contactList, 'M');
            },
            connectionTypeTwitter: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                return testConnectionType(contactList, 'A');
            },
            connectionTypeLinkedin: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                return testConnectionType(contactList, 'L');
            },
            displayName: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                Contact.store.add(createContact({
                    displayName: 'Bob',
                    app: app
                }));
                var identifierNode = contactList.get('firstNode').querySelector('.identifier');
                assert.strictEqual(identifierNode.textContent.trim(), 'Bob', 'Text in contactList should match what was set');
            }
        },
        'search and value tests': {
            beforeEach: function () {
                return createApp();
            },
            afterEach: function () {
                return util.removeAll(Contact.store).then(function () {
                    app.destroy();
                });
            },
            'search, successful values': function () {
                Contact.store.add(createContact({
                    displayName: 'Bob Smith',
                    app: app
                }));
                return testSearch('Bob');
            },
            'search, unsuccessful values': function () {
                Contact.store.add(createContact({
                    displayName: 'Bob Smith',
                    app: app
                }));
                return testSearch('Fred');
            },
            'set selected values using setter': function () {
                var contact1 = createContact({
                    id: 1,
                    displayName: 'Bob Smith',
                    accounts: [{ eType: 'E' }],
                    app: app
                });
                var contact2 = createContact({
                    id: 2,
                    displayName: 'Fred Smith',
                    accounts: [{ eType: 'M' }],
                    app: app
                });
                return Promise.all([
                    Contact.store.add(contact1),
                    Contact.store.add(contact2)
                ]).then(function () {
                    contactList.set('value', [contact1]);
                    assert.strictEqual(contactList.get('firstNode').querySelectorAll('.ContactRow.selected').length, 1);
                });
            }
        }
    });
});
//# sourceMappingURL=ContactList.js.map