define(["require", "exports", 'intern/chai!assert', 'dojo/_base/declare', 'app/viewModels/MessageFilters', 'mayhem/Promise', 'intern!object', 'app/models/stores/TrackableMemory', 'mayhem/WebApplication'], function (require, exports, assert, declare, MessageFilters, Promise, registerSuite, TrackableMemory, WebApplication) {
    var app;
    var model;
    registerSuite({
        name: 'app/viewModels/MessageFilters',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        counts: function () {
            var promises = [];
            promises.push(model.get('counts').then(function (counts) {
                assert.equal(Object.keys(counts).length, 0, 'No counts should be returned when `isOpen` is false.');
            }));
            model.set('isOpen', true);
            promises.push(model.get('counts').then(function (counts) {
                var pattern = /^\s\(\d+\)$/;
                Object.keys(counts).forEach(function (key) {
                    assert.isTrue(pattern.test(counts[key]));
                });
            }));
            return Promise.all(promises);
        },
        searchActions: function () {
            var searchActions = model.get('searchActions');
            var messages = app.get('i18n').get('messages');
            searchActions.forEach(function (action) {
                assert.equal(action.text, messages[action.filter]());
            });
        },
        selectedFilterLabel: function () {
            var messages = app.get('i18n').get('messages');
            assert.equal(model.get('selectedFilterLabel'), messages.allMessages(), 'The default filter should be marked as ' + messages.allMessages());
            model.set('selectedFilter', 'myMessages');
            assert.equal(model.get('selectedFilterLabel'), messages.myMessages());
            model.set('selectedFilter', 'newMessages');
            assert.equal(model.get('selectedFilterLabel'), messages.newMessages());
        },
        selectedSortLabel: function () {
            var messages = app.get('i18n').get('messages');
            assert.equal(model.get('selectedSortLabel'), messages.date(), 'The default sorting should be marked as ' + messages.date());
            model.set('selectedSort', 'sender');
            assert.equal(model.get('selectedSortLabel'), messages.sender());
            model.set('selectedSort', 'date');
            assert.equal(model.get('selectedSortLabel'), messages.date());
        },
        linkText: function () {
            var messages = app.get('i18n').get('messages');
            model.set('selectedFilter', 'myMessages');
            model.set('selectedSort', 'sender');
            assert.equal(model.get('linkText'), messages.filterBarLabel({
                filter: messages.myMessages(),
                sort: messages.sender()
            }));
        },
        stateClasses: function () {
            assert.include(model.get('stateClasses').split(' '), 'is-closed', 'State classes should be "is-closed" by default.');
            model.set('isOpen', true);
            assert.include(model.get('stateClasses').split(' '), 'is-open', 'State classes should be "is-open" when `isOpen` is `true`.');
            model.set('selectedFilter', 'newMessages');
            assert.include(model.get('stateClasses').split(' '), 'is-filtered--newMessages', 'State classes should contain the appropriate `is-filtered` modifier.');
            model.set('isOpen', false);
            model.set('isInSearchMode', true);
            assert.sameMembers(model.get('stateClasses').split(' '), ['is-open', 'is-inSearchMode', 'is-filtered--allResults'], 'Should have open, inSearchMode, and appropriate search filter states.');
            model.set('isInSearchMode', false);
            assert.sameMembers(model.get('stateClasses').split(' '), ['is-open', 'is-filtered--newMessages'], 'Toggling search mode should restore the standard filter state.');
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
        return app.run().then(function () {
            model = new MessageFilters({
                app: app,
                messages: new (declare(TrackableMemory, {
                    getMessageCounts: function () {
                        return Promise.resolve({
                            unreadMessageCount: 10,
                            newMessageCount: 3,
                            myMessageCount: 4
                        });
                    }
                }))()
            });
        });
    }
});
//# sourceMappingURL=MessageFilters.js.map