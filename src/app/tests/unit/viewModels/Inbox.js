define(["require", "exports", 'intern/chai!assert', 'app/viewModels/Inbox', 'app/models/Message', 'app/viewModels/MessageActions', 'app/viewModels/MessageFilters', 'app/models/stores/Message', 'intern!object', 'mayhem/WebApplication', '../../mocks/all'], function (require, exports, assert, Inbox, Message, MessageActionsViewModel, MessageFiltersViewModel, MessageStore, registerSuite, WebApplication, mocks) {
    var app;
    var model;
    mocks;
    registerSuite({
        name: 'app/viewModels/Inbox',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        'getters/setters': {
            isInSearchMode: function () {
                assert.isFalse(model.get('isInSearchMode'));
                model.set('masterSearchIsFocused', true);
                assert.isTrue(model.get('isInSearchMode'));
                model.set('masterSearchIsFocused', false);
                assert.isFalse(model.get('isInSearchMode'));
                model.set('masterSearchValue', 'Lorem ipsum');
                assert.isTrue(model.get('isInSearchMode'));
            },
            visibility: {
                initial: function () {
                    assert.isTrue(model.get('isMessageListVisible'));
                    assert.isFalse(model.get('isInboxZeroVisible'));
                },
                'search has focus': {
                    'no search value': function () {
                        model.set({
                            masterSearchIsFocused: true,
                            masterSearchValue: ''
                        });
                        assert.isFalse(model.get('isMessageListVisible'));
                        assert.isFalse(model.get('isInboxZeroVisible'));
                    },
                    'search is fetching': function () {
                        model.set({
                            isFetching: true,
                            masterSearchValue: 'Lorem ipsum',
                            masterSearchIsFocused: true
                        });
                        assert.isTrue(model.get('isMessageListVisible'));
                        assert.isFalse(model.get('isInboxZeroVisible'));
                    }
                },
                'search does not have focus': {
                    'when in search mode': function () {
                        model.set({
                            masterSearchValue: 'Lorem ipsum',
                            messageCount: 0,
                            searchResultCount: 0
                        });
                        assert.isFalse(model.get('isMessageListVisible'));
                        assert.isTrue(model.get('isInboxZeroVisible'));
                        model.set('searchResultCount', 100);
                        assert.isTrue(model.get('isMessageListVisible'));
                        assert.isFalse(model.get('isInboxZeroVisible'));
                    },
                    'when not in search mode': function () {
                        model.set({
                            messageCount: 0,
                            searchResultCount: 0
                        });
                        assert.isFalse(model.get('isMessageListVisible'));
                        assert.isTrue(model.get('isInboxZeroVisible'));
                        model.set('messageCount', 100);
                        assert.isTrue(model.get('isMessageListVisible'));
                        assert.isFalse(model.get('isInboxZeroVisible'));
                    }
                }
            }
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
            model = new Inbox({
                app: app,
                messageActionsModel: new MessageActionsViewModel({
                    app: app,
                    hideDistribute: true,
                    hideMore: true,
                    isOpen: true
                }),
                messageFiltersModel: new MessageFiltersViewModel({
                    app: app
                })
            });
        });
    }
});
//# sourceMappingURL=Inbox.js.map