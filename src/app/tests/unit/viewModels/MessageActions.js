define(["require", "exports", 'intern/chai!assert', 'app/viewModels/MessageActions', 'intern!object', 'mayhem/WebApplication'], function (require, exports, assert, MessageActions, registerSuite, WebApplication) {
    var app;
    var model;
    registerSuite({
        name: 'app/viewModels/MessageActions',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        'static methods': {
            getDefaultExcludedFolders: function () {
                var excluded = MessageActions.getDefaultExcludedFolders();
                assert.sameMembers(excluded, ['Drafts', 'Outbox', 'Sent', 'Archive'], 'Drafts, Outbox, Sent, and Archive should be excluded by default.');
                excluded = MessageActions.getDefaultExcludedFolders(['Inbox']);
                assert.include(excluded, 'Inbox', 'Passed-in folders should also be in the returned array.');
                excluded = MessageActions.getDefaultExcludedFolders(['Drafts']);
                assert.sameMembers(excluded, ['Drafts', 'Outbox', 'Sent', 'Archive'], 'Duplicate folder names should be ignored.');
            }
        },
        'getters/setters': {
            markAsActions: function () {
                var length = model.get('markAsActions').length;
                assert.equal(length, 6, 'All six actions should be available by default.');
                model.set('markAsActions', ['read', 'unread', 'whitelist']);
                length = model.get('markAsActions').length;
                assert.equal(length, 3, 'Only the specified actions should be returned.');
                model.get('markAsActions').forEach(function (action) {
                    assert.isTrue(typeof action.iconClass === 'string', '`iconClass` should be provided');
                    assert.isTrue(typeof action.property === 'string', '`property` should be provided.');
                    assert.isTrue(typeof action.displayCondition === 'boolean', '`displayCondition` should be provided.');
                });
            },
            stateClasses: function () {
                assert.equal(model.get('stateClasses'), 'is-hidden', 'State class should be `is-hidden` by default.');
                model.set('isOpen', true);
                assert.equal(model.get('stateClasses'), '', 'State class should be empty when `isOpen` is true.');
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
        return app.run().then(function () {
            model = new MessageActions({
                app: app
            });
        });
    }
});
//# sourceMappingURL=MessageActions.js.map