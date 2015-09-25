define(["require", "exports", 'intern/chai!assert', 'intern!object', '../../ui/app', 'app/models/Message', 'app/models/Folder', 'app/models/stores/Folder', 'dstore/Memory'], function (require, exports, assert, registerSuite, app, Message, Folder, FolderStore, Memory) {
    FolderStore;
    Folder.setDefaultApp(app);
    Message.setDefaultApp(app);
    var defaultFolderStore = Folder.store;
    var unreadMessageCount = 42;
    registerSuite({
        name: 'app/models/Folder',
        before: function () {
            Folder.setDefaultStore(new Memory());
        },
        after: function () {
            Folder.setDefaultStore(defaultFolderStore);
        },
        beforeEach: function () {
            resetData();
        },
        afterEach: function () {
            app.destroy();
        },
        '#get': function () {
            return Folder.get(0).then(function (folder) {
                assert.equal(folder.get('name'), 'Inbox');
            });
        },
        '#updateUnreadCount': function () {
            return Folder.get(0).then(function (folder) {
                var count = folder.get('unreadMessageCount');
                folder.updateUnreadCount(true);
                assert.equal(folder.get('unreadMessageCount'), count - 1);
                folder.updateUnreadCount(false);
                assert.equal(folder.get('unreadMessageCount'), count);
            });
        },
        '.updateUnreadCount': {
            unread: function () {
                var message = new Message({
                    folderId: 0
                });
                return Folder.updateUnreadCount(message).then(function (folder) {
                    assert.equal(folder.get('unreadMessageCount'), unreadMessageCount + 1);
                });
            },
            'read': {
                'zero count': function () {
                    var message = new Message({
                        folderId: 0,
                        isRead: true
                    });
                    return Folder.get(0).then(function (folder) {
                        folder.set('unreadMessageCount', 0);
                        return Folder.updateUnreadCount(message).then(function (folder) {
                            assert.equal(folder.get('unreadMessageCount'), 0);
                        });
                    });
                },
                'non-zero count': function () {
                    var message = new Message({
                        folderId: 0,
                        isRead: true
                    });
                    return Folder.updateUnreadCount(message).then(function (folder) {
                        assert.equal(folder.get('unreadMessageCount'), unreadMessageCount - 1);
                    });
                }
            },
            'previous folder': function () {
                var message = new Message({
                    folderId: 0
                });
                return Folder.updateUnreadCount(message).then(function (inbox) {
                    var count = inbox.get('unreadMessageCount');
                    message.set('folderId', 5);
                    return Folder.updateUnreadCount(message, 0).then(function () {
                        assert.equal(inbox.get('unreadMessageCount'), count - 1);
                    });
                });
            }
        }
    });
    function resetData() {
        Folder.store.setData([
            { id: 0, name: 'Inbox', unreadMessageCount: unreadMessageCount },
            { id: 1, name: 'Drafts' },
            { id: 2, name: 'Outbox', unreadMessageCount: 3 },
            { id: 3, name: 'Sent' },
            { id: 4, name: 'Templates' },
            { id: 5, name: 'Junk' },
            { id: 6, name: 'Trash' },
            {
                id: 7,
                name: 'Archive',
                children: ['Archive Child 1', 'Archive Child 2']
            },
            { id: 8, name: 'Archive Child 1', type: 'personal' },
            { id: 9, name: 'Archive Child 2', type: 'personal' },
            { id: 10, name: 'Business', type: 'personal' },
            { id: 11, name: 'Viva-Lite', type: 'shared' },
            { id: 12, name: 'Private', type: 'personal' }
        ]);
    }
});
//# sourceMappingURL=Folder.js.map