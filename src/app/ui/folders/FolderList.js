var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'dojo/dom-class', 'mayhem/Event', './FolderRow', '../../viewModels/FolderList', 'mayhem/ui/dom/ListView', '../../models/RecentlyUsedFolder', '../search/SearchWidget', 'mayhem/util'], function (require, exports, domClass, Event, FolderRow, FolderProxy, ListView, RecentlyUsedFolder, SearchWidget, util) {
    var FolderList = (function (_super) {
        __extends(FolderList, _super);
        function FolderList(kwArgs) {
            util.deferSetters(this, ['collection', 'recentlyUsedFolders', 'search'], '_render');
            _super.call(this, kwArgs);
        }
        FolderList.prototype._collectionGetter = function () {
            return this._collection;
        };
        FolderList.prototype._collectionSetter = function (value) {
            var _this = this;
            if (value) {
                this._collection = FolderProxy.forCollection(value);
                this._setMainListCollection();
                this._setArchiveListCollection();
                this._currentFolderHandle && this._currentFolderHandle.remove();
                this._currentFolderHandle = this.get('app').get('binder').createBinding(this, 'currentFolderId').observe(function (change) {
                    var currentFolderId = change.value;
                    if (typeof currentFolderId === 'number') {
                        _this._collection.forEach(function (folder) {
                            folder.set('isHighlighted', (folder.get('id') === currentFolderId));
                        });
                    }
                });
            }
        };
        FolderList.prototype._excludedGetter = function () {
            return this._excluded && this._excluded.slice();
        };
        FolderList.prototype._excludedSetter = function (value) {
            this._excluded = value;
            if (value && this._collection) {
                this._setMainListCollection();
            }
        };
        FolderList.prototype._recentlyUsedFoldersGetter = function () {
            return this._recentlyUsedFolders;
        };
        FolderList.prototype._recentlyUsedFoldersSetter = function (value) {
            var _this = this;
            this._recentlyUsedFolders = value;
            this._recentlyUsedFoldersHandle && this._recentlyUsedFoldersHandle.remove();
            if (value) {
                this._recentlyUsedFoldersHandle = value.on('add,update,delete', function () {
                    _this._setRecentlyUsedListCollection();
                });
                this._setRecentlyUsedListCollection();
            }
        };
        FolderList.prototype._isAttachedGetter = function () {
            return this._isAttached;
        };
        FolderList.prototype._isAttachedSetter = function (value) {
            _super.prototype._isAttachedSetter.call(this, value);
            this._mainList.set('isAttached', value);
            this._recentlyUsedList && this._recentlyUsedList.set('isAttached', value);
            this._archiveList && this._archiveList.set('isAttached', value);
        };
        FolderList.prototype._searchSetter = function (search) {
            if (this._isAttached && this._collection) {
                this._searchInputWidget.set('value', search);
                this._setMainListCollection(search);
                if (this._archiveList) {
                    this._setArchiveListCollection(search);
                }
                if (this._recentlyUsedList) {
                    domClass.toggle(this._recentlyUsedList.get('firstNode'), 'is-hidden', !!search);
                }
            }
            this._search = search;
        };
        FolderList.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._mainList.destroy();
            this._recentlyUsedList && this._recentlyUsedList.destroy();
            this._archiveList && this._archiveList.destroy();
            this._currentFolderHandle && this._currentFolderHandle.remove();
            this._recentlyUsedFoldersHandle && this._recentlyUsedFoldersHandle.remove();
        };
        FolderList.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._excluded = [];
            this._value = '';
            this._showUnreadCount = true;
            this._showRecentlyUsed = false;
            this._showArchives = false;
            this._containerClass = '';
            this._listClass = '';
        };
        FolderList.prototype._render = function () {
            this._node = document.createElement('div');
            domClass.add(this._node, 'FolderListContainer');
            this._groupNode = document.createElement('div');
            this._groupNode.className = 'FolderList-group';
            if (this._containerClass) {
                domClass.add(this._node, this._containerClass);
            }
            if (this._showRecentlyUsed) {
                this._recentlyUsedList = this._createListView(false);
                domClass.add(this._recentlyUsedList.get('firstNode'), 'FolderList--recentlyUsed');
            }
            this._mainList = this._createListView(true);
            if (this._showArchives) {
                this._archiveList = this._createListView(false);
                domClass.add(this._archiveList.get('firstNode'), 'FolderList--archives');
            }
            this._node.appendChild(this._groupNode);
            this._registerEvents();
        };
        FolderList.prototype._setRecentlyUsedListCollection = function (search) {
            var listView = this._recentlyUsedList;
            var collection = this._recentlyUsedFolders;
            var self = this;
            if (listView) {
                RecentlyUsedFolder.getFolders(collection).then(function (folders) {
                    listView.set('collection', folders);
                    self._setListStateClass(listView.get('firstNode'), folders);
                });
            }
        };
        FolderList.prototype._setMainListCollection = function (search) {
            var listView = this._mainList;
            var collection = this._collection.exclude(['Archive'], 'parentFolder').exclude(this._excluded, 'name');
            if (search && search.length) {
                collection = this._filterSearchResults(collection, search);
            }
            listView.set('collection', collection);
            this._setListStateClass(listView.get('firstNode'), collection);
        };
        FolderList.prototype._setArchiveListCollection = function (search) {
            var listView = this._archiveList;
            if (listView) {
                var collection = this._collection.include(['Archive'], 'parentFolder');
                if (search && search.length) {
                    collection = this._filterSearchResults(collection, search);
                }
                listView.set('collection', collection);
                this._setListStateClass(listView.get('firstNode'), collection);
            }
        };
        FolderList.prototype._filterSearchResults = function (collection, search) {
            var pattern = new RegExp(search, 'i');
            return collection.filter(function (folder) {
                return pattern.test(folder.get('name'));
            });
        };
        FolderList.prototype._setListStateClass = function (node, collection) {
            collection.fetch().then(function (folders) {
                domClass.toggle(node, 'is-empty', !folders.length);
            });
        };
        FolderList.prototype._createListView = function (showUnreadCount) {
            if (showUnreadCount === void 0) { showUnreadCount = true; }
            var listViewNode;
            var listView = new ListView({
                app: this.get('app'),
                itemConstructor: FolderRow,
                parent: this,
                sort: 'name'
            });
            listViewNode = listView.detach();
            domClass.add(listViewNode, 'dgrid-autoheight FolderList');
            if (this._listClass) {
                domClass.add(listViewNode, this._listClass);
            }
            if (!showUnreadCount || !this._showUnreadCount) {
                domClass.add(listViewNode, 'is-unreadCountHidden');
            }
            this._groupNode.appendChild(listViewNode);
            return listView;
        };
        FolderList.prototype._registerEvents = function () {
            var _this = this;
            this.on('activate', function (event) {
                var target = event.target;
                if (target instanceof FolderRow) {
                    _this.emit(new Event({
                        type: 'folderSelected',
                        bubbles: true,
                        cancelable: false,
                        target: target
                    }));
                }
            });
        };
        return FolderList;
    })(SearchWidget);
    var FolderList;
    (function (FolderList) {
        ;
        ;
    })(FolderList || (FolderList = {}));
    return FolderList;
});
//# sourceMappingURL=FolderList.js.map