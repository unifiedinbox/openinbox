define(["require", "exports", 'dojo/_base/lang', 'intern/chai!assert', 'intern!object', 'app/has', 'mayhem/WebApplication', 'app/models/Message', 'app/models/Folder', 'app/models/stores/Folder', 'app/models/RecentlyUsedFolder', 'app/ui/folders/FolderList', 'app/models/stores/TrackableMemory', 'app/util'], function (require, exports, lang, assert, registerSuite, has, WebApplication, Message, Folder, FolderStore, RecentlyUsedFolder, FolderList, TrackableMemory, util) {
    FolderStore;
    var app;
    var folderList;
    var excluded = ['Drafts', 'Outbox', 'Sent', 'Archive'];
    var recentlyUsedFolders = new TrackableMemory();
    var INBOX_ID = 5;
    registerSuite({
        name: 'app/ui/folders/FolderList',
        'base tests': {
            beforeEach: function () {
                return createApp();
            },
            afterEach: function () {
                app.destroy();
            },
            mainList: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var links = folderList.get('firstNode').querySelectorAll('.Folder-link');
                Array.prototype.slice.call(links).forEach(function (node) {
                    var folderName = node.firstChild.nodeValue;
                    assert.strictEqual(excluded.indexOf(folderName), -1, 'Folder "' + folderName + '" should not be in the excluded array, since it appears in the list');
                });
            },
            classNames: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                var folders = Folder.store.exclude(excluded, 'name');
                var node = folderList.get('firstNode');
                assert.isTrue(node.classList.contains('wrapper'));
                return folders.forEach(function (folder) {
                    if (folder.get('parentFolder')) {
                        return;
                    }
                    var folderNode = node.querySelector('.Folder--' + util.toCamelCase(folder.get('name')));
                    var type = folder.get('type');
                    assert.isNotNull(folderNode);
                    assert.isTrue(folderNode.classList.contains('Folder'));
                    assert.isTrue(folderNode.classList.contains('Folder--' + type));
                });
            }
        },
        'options tests': {
            afterEach: function () {
                app.destroy();
            },
            'unread counts': {
                off: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    createApp({ showUnreadCount: false }).then(function () {
                        var listNode = folderList.get('firstNode').querySelector('.FolderList');
                        assert.isTrue(listNode.classList.contains('is-unreadCountHidden'));
                    });
                },
                on: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    return createApp().then(function () {
                        return Folder.get(INBOX_ID).then(function (folder) {
                            var unreadCount = folder.get('unreadMessageCount') || 0;
                            return Folder.updateUnreadCount(new Message({
                                folderId: folder.get('id'),
                                isRead: false
                            })).then(function () {
                                assert.equal(folder.get('unreadMessageCount'), unreadCount + 1);
                            });
                        });
                    });
                }
            },
            search: {
                off: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    return createApp().then(function () {
                        var node = folderList.get('firstNode');
                        assert.isNull(node.querySelector('.search-container'), 'Search component should not be displayed');
                    });
                },
                on: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    return createApp({ showSearch: true }).then(function () {
                        var node = folderList.get('firstNode');
                        assert.isNotNull(node.querySelector('.search-container'), 'Search component should be displayed');
                    });
                }
            },
            'recently used folders': {
                off: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    return createApp().then(function () {
                        var node = folderList.get('firstNode');
                        assert.isNull(node.querySelector('.FolderList--recentlyUsed'), 'Recently used folders should not be displayed');
                    });
                },
                on: {
                    emptyCollection: function () {
                        if (!has('host-browser')) {
                            this.skip('requires browser');
                        }
                        return createApp({
                            recentlyUsedFolders: recentlyUsedFolders,
                            showRecentlyUsed: true
                        }).then(function () {
                            var node = folderList.get('firstNode');
                            var listNode = node.querySelector('.FolderList--recentlyUsed');
                            assert.isNotNull(listNode, 'Recently used folders should be displayed');
                            assert.isTrue(listNode.classList.contains('is-empty'), 'Recently used folders should be empty');
                        });
                    },
                    nonEmptyCollection: function () {
                        if (!has('host-browser')) {
                            this.skip('requires browser');
                        }
                        return createApp({
                            showRecentlyUsed: true,
                            recentlyUsedFolders: recentlyUsedFolders
                        }).then(function () {
                            return recentlyUsedFolders.put(new RecentlyUsedFolder({ id: INBOX_ID })).then(function () {
                                folderList.set('recentlyUsedFolders', recentlyUsedFolders);
                                var listNode = folderList.get('firstNode').querySelector('.FolderList--recentlyUsed');
                                assert.isFalse(listNode.classList.contains('is-empty'), 'Recently used folders should not be empty');
                            });
                        });
                    }
                }
            },
            'archive folders': {
                off: function () {
                    if (!has('host-browser')) {
                        this.skip('requires browser');
                    }
                    return createApp().then(function () {
                        var node = folderList.get('firstNode');
                        assert.isNull(node.querySelector('.FolderList--archives'), 'Archive folder should not be displayed');
                    });
                },
                on: {
                    emptyCollection: function () {
                        if (!has('host-browser')) {
                            this.skip('requires browser');
                        }
                        return createApp({ showArchives: true }).then(function () {
                            var node = folderList.get('firstNode');
                            var listNode = node.querySelector('.FolderList--archives');
                            assert.isNotNull(listNode, 'Archive folder should be displayed');
                            assert.isTrue(listNode.classList.contains('is-empty'), 'Archive folder should be empty');
                        });
                    },
                    nonEmptyCollection: function () {
                        if (!has('host-browser')) {
                            this.skip('requires browser');
                        }
                        return createApp({ showArchives: true }, true).then(function () {
                            var listNode = folderList.get('firstNode').querySelector('.FolderList--archives');
                            assert.isFalse(listNode.classList.contains('is-empty'), 'Archive folder should not be empty');
                        });
                    }
                }
            }
        }
    });
    function createApp(kwArgs, includeArchives) {
        if (includeArchives === void 0) { includeArchives = false; }
        app = new WebApplication({
            name: 'Test',
            components: {
                i18n: { preload: ['app/nls/main'] },
                router: null,
                ui: {
                    view: null
                },
                user: {
                    constructor: 'app/auth/User'
                }
            }
        });
        Folder.setDefaultApp(app);
        Folder.store.app = app;
        Message.setDefaultApp(app);
        RecentlyUsedFolder.setDefaultApp(app);
        if (!includeArchives) {
            Folder.store = Folder.store.filter(new Folder.store.Filter().ne('parentFolder', 'Archive'));
        }
        else {
            Folder.store = Folder.store.root || Folder.store;
        }
        return app.run().then(function () {
            folderList = new FolderList(lang.mixin({}, kwArgs, {
                app: app,
                collection: Folder.store,
                containerClass: 'wrapper',
                excluded: excluded
            }));
            app.get('ui').set('view', folderList);
        });
    }
});
//# sourceMappingURL=FolderList.js.map