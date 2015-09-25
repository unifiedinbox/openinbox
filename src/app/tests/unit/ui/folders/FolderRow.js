define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/models/Folder', 'app/viewModels/FolderList', 'app/ui/folders/FolderRow', 'app/has', 'mayhem/WebApplication'], function (require, exports, assert, registerSuite, Folder, FolderProxy, FolderRow, has, WebApplication) {
    var app;
    var folder;
    var folderRow;
    registerSuite({
        name: 'app/ui/folders/FolderRow',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        'initialization': {
            'message count': function () {
                var countNode = folderRow.get('firstNode').querySelector('.Folder-unreadCount');
                assert.isTrue(countNode.classList.contains('is-hidden'), 'The unread count node should be hidden when count is zero');
            }
        },
        'data binding': {
            'message count': function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var countNode = folderRow.get('firstNode').querySelector('.Folder-unreadCount');
                var expectedCount = 30;
                var count;
                folder.set('unreadMessageCount', expectedCount);
                count = Number(countNode.firstChild.nodeValue);
                assert.equal(count, expectedCount, 'Displayed unread message count');
                assert.isFalse(countNode.classList.contains('is-hidden'), 'The unread count node should be displayed when count is greater than zero');
                folder.set('unreadMessageCount', 0);
                count = Number(countNode.firstChild.nodeValue);
                assert.equal(count, 0, 'Displayed unread message count');
                assert.isTrue(countNode.classList.contains('is-hidden'), 'The unread count node should be hidden when count is zero');
            },
            'current folder': function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var folderNode = folderRow.get('firstNode');
                folder.set('isHighlighted', true);
                assert.include(folderNode.className, 'is-highlighted', 'Folder node class name');
                folder.set('isHighlighted', false);
                assert.notInclude(folderNode.className, 'is-highlighted', 'Folder node class name');
            }
        }
    });
    function createApp() {
        app = new WebApplication({
            name: 'Folder List Test',
            components: {
                router: null,
                ui: {
                    view: null
                }
            }
        });
        Folder.setDefaultApp(app);
        return app.run().then(function () {
            folder = new FolderProxy({
                app: app,
                target: new Folder({
                    id: 10,
                    name: 'Multi-word Folder Name'
                })
            });
            folderRow = new FolderRow({
                app: app,
                model: folder
            });
            app.get('ui').set('view', folderRow);
        });
    }
});
//# sourceMappingURL=FolderRow.js.map