define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'dojo/_base/lang', 'mayhem/WebApplication', 'app/ui/search/MasterSearch', 'app/models/stores/TrackableMemory', 'app/models/Contact', 'app/viewModels/MasterSearch'], function (require, exports, assert, registerSuite, has, lang, WebApplication, MasterSearch, TrackableMemory, Contact, ContactProxy) {
    var app;
    var search;
    registerSuite({
        name: 'app/ui/SearchWidget',
        'results navigation': {
            beforeEach: function () {
                return createApp().then(function () {
                    search.set('search', 'Tester');
                });
            },
            afterEach: function () {
                app.destroy();
            },
            searchResults: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                return search.get('searchResults').then(function (contacts) {
                    contacts.forEach(function (contact) {
                        assert.notStrictEqual(contact.get('displayName').indexOf('Tester'), -1, 'The filtered results should match the search value.');
                    });
                });
            },
            nextRow: {
                initial: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    search.nextRow();
                    return search.get('searchResults').then(function (contacts) {
                        contacts.forEach(function (contact, index) {
                            var isHighlighted = contact.get('isHighlighted');
                            assert.isTrue(index === 0 ? isHighlighted : !isHighlighted, 'Only the first row should be highlighted.');
                        });
                    });
                },
                last: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    return search.get('searchResults').then(function (contacts) {
                        navigateToRow(contacts.length);
                        contacts.forEach(function (contact, index) {
                            var isHighlighted = contact.get('isHighlighted');
                            assert.isTrue(index === 0 ? isHighlighted : !isHighlighted, 'Navigating forward from the final result should highlight the first.');
                        });
                    });
                }
            },
            previousRow: {
                initial: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    search.previousRow();
                    return search.get('searchResults').then(function (contacts) {
                        contacts.forEach(function (contact, index) {
                            var isHighlighted = contact.get('isHighlighted');
                            assert.isTrue(index === contacts.length - 1 ? isHighlighted : !isHighlighted, 'Navigating backward from the first result should highlight the last.');
                        });
                    });
                },
                index: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    return search.get('searchResults').then(function (contacts) {
                        navigateToRow(contacts.length - 1);
                        search.previousRow();
                        contacts.forEach(function (contact, index) {
                            var isHighlighted = contact.get('isHighlighted');
                            assert.isTrue(index === contacts.length - 2 ? isHighlighted : !isHighlighted, 'Only the second-to-last row should be highlighted.');
                        });
                    });
                }
            },
            selectRow: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var dfd = this.async(1000);
                search.previousRow();
                search.get('searchResults').then(function (contacts) {
                    search.on('searchSubmit', dfd.callback(function (event) {
                        assert.isDefined(event.item, 'event.item should be defined when an item is selected');
                        assert.strictEqual(event.item, contacts[contacts.length - 1], 'Reported item should be the last in the list');
                    }));
                    search.selectRow();
                });
                return dfd;
            },
            hideList: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var node = search.get('firstNode').querySelector('.ContactList');
                search.previousRow();
                search.selectRow();
                assert.isTrue(node.classList.contains('is-hidden'));
            }
        }
    });
    function navigateToRow(index) {
        while (index >= 0) {
            search.nextRow();
            index -= 1;
        }
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
        Contact.setDefaultApp(app);
        return app.run().then(function () {
            search = new MasterSearch(lang.mixin({}, kwArgs, {
                app: app,
                collection: ContactProxy.forCollection(resetStore()),
                searchPlaceholder: app.get('i18n').get('messages').searchPlaceholder()
            }));
            app.get('ui').set('view', search);
        });
    }
    function resetStore() {
        var store = new TrackableMemory();
        [
            'Firstname Lastname',
            'User McUserton',
            'Chester Tester',
            'Esther Tester',
            'Lester McTester',
            'Tester McTesterson'
        ].forEach(function (name) {
            var nameParts = name.split(' ');
            store.put(new Contact({
                displayName: name,
                image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
            }));
        });
        return store;
    }
});
//# sourceMappingURL=NavigableSearchWidget.js.map