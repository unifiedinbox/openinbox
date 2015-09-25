define(["require", "exports", 'intern/chai!assert', 'intern!object', 'mayhem/WebApplication', 'app/models/Folder', 'app/models/stores/Folder', '../../mocks/data/getAllFolders', 'app/models/RecentlyUsedFolder', 'dstore/Memory'], function (require, exports, assert, registerSuite, WebApplication, Folder, FolderStore, folderData, RecentlyUsedFolder, Memory) {
    FolderStore;
    var app;
    var collection;
    registerSuite({
        name: 'app/models/RecentlyUsedFolder',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        '.getFolders': function () {
            return RecentlyUsedFolder.getFolders(collection).then(function (folders) {
                return folders.fetch().then(function (folders) {
                    assert.sameMembers(folders.map(function (f) { return f.get('name'); }), ['Inbox', 'Drafts']);
                    assert.isTrue(folders.every(function (f) { return f instanceof Folder; }), 'RecentlyUsedFolder.getFolders should return Folder models');
                });
            });
        }
    });
    function createApp() {
        app = new WebApplication({
            name: 'Test',
            components: {
                user: {
                    constructor: 'app/auth/user'
                },
                router: null,
                ui: {
                    view: null
                }
            }
        });
        Folder.setDefaultApp(app);
        Folder.store.app = app;
        RecentlyUsedFolder.setDefaultApp(app);
        return app.run().then(function () {
            collection = createStore();
        });
    }
    function createStore() {
        var recentsStore = new Memory();
        var recents = folderData.UNIFIED.filter(function (item) {
            return item.name === 'Inbox' || item.name === 'Drafts';
        }).map(function (item) {
            return new RecentlyUsedFolder({ id: item.index });
        });
        recentsStore.setData(recents);
        return recentsStore;
    }
});
//# sourceMappingURL=RecentlyUsedFolder.js.map