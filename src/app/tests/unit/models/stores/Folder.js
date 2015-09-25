define(["require", "exports", 'intern/chai!assert', 'app/models/Folder', 'app/models/stores/Folder', '../../../mocks/getAllFolders', 'intern!object', 'mayhem/Promise', 'mayhem/WebApplication'], function (require, exports, assert, Folder, FolderStore, foldersMock, registerSuite, Promise, WebApplication) {
    FolderStore;
    foldersMock;
    var TEST_DATA_FOLDER_COUNT = 13;
    var ARCHIVE_CHILD_COUNT = 4;
    var STATIC_FOLDER_COUNT = 9;
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
                Folder.setDefaultApp(app);
                Folder.setDefaultStore(new FolderStore({ app: app }));
            });
        });
    }
    registerSuite({
        name: 'app/models/stores/Folder',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        'fetch': function () {
            return Folder.store.fetch().then(function (results) {
                assert.strictEqual(results.length, TEST_DATA_FOLDER_COUNT, 'Number of results');
            });
        },
        'filter': function () {
            return Promise.all([
                Folder.store.filter({ parentFolder: 'Archive' }).fetch().then(function (results) {
                    assert.strictEqual(results.length, ARCHIVE_CHILD_COUNT, 'Number of children of "Archive"');
                }),
                Folder.store.filter({ type: 'staticFolder' }).fetch().then(function (results) {
                    assert.strictEqual(results.length, STATIC_FOLDER_COUNT, 'Number of folders with type "staticFolder"');
                })
            ]);
        },
        'totalLength': function () {
            return Folder.store.fetch().totalLength.then(function (val) {
                assert.strictEqual(val, TEST_DATA_FOLDER_COUNT, 'totalLength of results');
            });
        }
    });
});
//# sourceMappingURL=Folder.js.map