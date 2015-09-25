var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/ui/ListView', 'mayhem/util', 'mayhem/routing/PathRegExp', './ConnectionRow', '../../models/adapters/eType', '../search/SearchWidget', '../../viewModels/SelectionManager', '../Avatar', '../TooltipLabel'], function (require, exports, SingleNodeWidget, ListView, util, PathRegExp, ConnectionRow, eTypeAdapter, SearchWidget, SelectionManager, Avatar, TooltipLabel) {
    var SelectAllWidget = (function (_super) {
        __extends(SelectAllWidget, _super);
        function SelectAllWidget(kwArgs) {
            util.deferSetters(this, ['text', 'isAllSelected'], '_render');
            _super.call(this, kwArgs);
        }
        SelectAllWidget.prototype._isAllSelectedGetter = function () {
            return this._isAllSelected;
        };
        SelectAllWidget.prototype._isAllSelectedSetter = function (isAllSelected) {
            var messages = this.get('app').get('i18n').get('messages');
            this.set('text', isAllSelected ? messages.selectNone() : messages.selectAll());
            this._isAllSelected = isAllSelected;
        };
        SelectAllWidget.prototype._textGetter = function () {
            return this._text;
        };
        SelectAllWidget.prototype._textSetter = function (text) {
            this._text = text;
            if (this._node.firstChild) {
                this._node.removeChild(this._node.firstChild);
            }
            this._node.appendChild(document.createTextNode(this._text));
        };
        SelectAllWidget.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this.set('isAllSelected', false);
        };
        SelectAllWidget.prototype._render = function () {
            this._node = document.createElement('a');
            this._node.className = 'select-all';
        };
        return SelectAllWidget;
    })(SingleNodeWidget);
    var GroupedConnectionList = (function (_super) {
        __extends(GroupedConnectionList, _super);
        function GroupedConnectionList(kwArgs) {
            util.deferSetters(this, ['collection', 'search', 'value'], '_render');
            _super.call(this, kwArgs);
        }
        GroupedConnectionList.prototype._collectionGetter = function () {
            return this._collection;
        };
        GroupedConnectionList.prototype._collectionSetter = function (collection) {
            this._filteredCollection = null;
            this._collection = collection;
            if (!collection) {
                this._wrappedCollection = null;
                return;
            }
            var wrappedCollection = this._wrappedCollection = this._selectionManager.wrapCollection(collection);
            this._selectionManager.reset();
            eTypeAdapter.forEachType(function (type) {
                var _this = this;
                var connectionType = eTypeAdapter.toConnectionType(type);
                var filteredCollection = wrappedCollection.filter({ type: type }).track();
                this._listViews[connectionType].set('collection', filteredCollection);
                filteredCollection.fetch().totalLength.then(function (total) {
                    _this._totals[connectionType] = total;
                    _this._toggleContactListGroup(connectionType, total > 0);
                });
                filteredCollection.on('add, delete', function (event) {
                    _this._totals[connectionType] = event.totalLength;
                    _this._toggleContactListGroup(connectionType, event.totalLength > 0);
                    _this._updateSelectAllState(type);
                });
                this._selectAllWidgets[connectionType].set('isAllSelected', false);
            }, this);
        };
        GroupedConnectionList.prototype._isAttachedGetter = function () {
            return this._isAttached;
        };
        GroupedConnectionList.prototype._isAttachedSetter = function (value) {
            for (var connectionType in this._listViews) {
                if (this._listViews[connectionType]) {
                    this._listViews[connectionType].set('isAttached', value);
                }
            }
            this._isAttached = value;
        };
        GroupedConnectionList.prototype._searchGetter = function () {
            return this._search;
        };
        GroupedConnectionList.prototype._searchSetter = function (search) {
            if (search) {
                var self = this;
                var value = PathRegExp.escape(search);
                this._filteredCollection = this._wrappedCollection.filter({ displayName: new RegExp(value, 'i') });
                this._selectionManager.reset();
                eTypeAdapter.forEachType(function (type) {
                    var connectionType = eTypeAdapter.toConnectionType(type);
                    var listView = this._listViews[connectionType];
                    var filteredCollection = this._filteredCollection.filter({ type: type });
                    listView.set('collection', filteredCollection);
                    filteredCollection.fetch().totalLength.then(function (count) {
                        self._toggleContactListGroup(connectionType, count > 0);
                    });
                    this._selectAllWidgets[connectionType].set('isAllSelected', false);
                }, this);
            }
            else {
                this.set('collection', this._collection);
            }
            this._search = search;
        };
        GroupedConnectionList.prototype._showSearchSetter = function (showSearch) {
            _super.prototype._showSearchSetter.call(this, showSearch);
            this.set('search', '');
        };
        GroupedConnectionList.prototype._valueGetter = function () {
            return this._selectionManager.get('selectedCollection');
        };
        GroupedConnectionList.prototype._valueSetter = function (value) {
            var _this = this;
            var collection = this.get('collection');
            this._selectionManager.reset();
            value = value || [];
            value.forEach(function (connection) {
                this._wrappedCollection.get(collection.getIdentity(connection)).then(function (item) {
                    item.set('isSelected', true);
                });
            }, this);
            eTypeAdapter.forEachType(function (type) {
                _this._updateSelectAllState(type);
            });
        };
        GroupedConnectionList.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            for (var connectionType in this._listViews) {
                if (this._listViews[connectionType]) {
                    this._listViews[connectionType].destroy();
                }
                if (this._selectAllWidgets[connectionType]) {
                    this._selectAllWidgets[connectionType].destroy();
                }
            }
        };
        GroupedConnectionList.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._containerNodes = {};
            this._listViewNodes = {};
            this._listViews = {};
            this._selectAllWidgets = {};
            this._totals = {};
            this._selectionManager = new SelectionManager();
            this._value = [];
        };
        GroupedConnectionList.prototype._renderHeaderNode = function (connectionType) {
            var title = this.get('app').get('i18n').get('messages')[connectionType]();
            var titleNode = document.createElement('span');
            titleNode.classList.add('header-title');
            titleNode.appendChild(document.createTextNode(title));
            this._selectAllWidgets[connectionType] = new SelectAllWidget({
                app: this.get('app'),
                connectionType: connectionType,
                parent: this
            });
            var headerNode = document.createElement('div');
            headerNode.classList.add('group-header');
            headerNode.appendChild(titleNode);
            headerNode.appendChild(this._selectAllWidgets[connectionType].detach());
            return headerNode;
        };
        GroupedConnectionList.prototype._renderGroupedListNode = function (connectionType) {
            this._listViews[connectionType] = new ListView({
                app: this.get('app'),
                parent: this,
                itemConstructor: ConnectionRow
            });
            var listViewNode = this._listViews[connectionType].detach();
            listViewNode.classList.add('dgrid-autoheight');
            listViewNode.classList.add('ContactList-grid');
            var containerNode = document.createElement('div');
            containerNode.className = 'group-container connection-type-' + connectionType + ' is-hidden';
            containerNode.appendChild(this._renderHeaderNode(connectionType));
            containerNode.appendChild(listViewNode);
            this._listViewNodes[connectionType] = listViewNode;
            this._containerNodes[connectionType] = containerNode;
            return containerNode;
        };
        GroupedConnectionList.prototype._rowSelectionHandler = function (event) {
            if (event.target instanceof SelectAllWidget) {
                this._selectAllHandler(event);
            }
            else if (event.target !== this) {
                var connectionRow;
                if (event.target instanceof Avatar || event.target instanceof TooltipLabel) {
                    connectionRow = event.target.get('parent');
                }
                else {
                    connectionRow = event.target;
                }
                this._selectHandler(connectionRow);
            }
        };
        GroupedConnectionList.prototype._updateSelectAllState = function (type) {
            var connectionType = eTypeAdapter.toConnectionType(type);
            var totalSelected = this._selectionManager.get('selectedCollection').filter({ type: type }).fetchSync().totalLength;
            this._selectAllWidgets[connectionType].set('isAllSelected', totalSelected === this._totals[connectionType]);
        };
        GroupedConnectionList.prototype._selectAllHandler = function (event) {
            var widget = event.target;
            var connectionType = widget._connectionType;
            var isAllSelected = !widget.get('isAllSelected');
            widget.set('isAllSelected', isAllSelected);
            (this._filteredCollection || this._wrappedCollection).forEach(function (connection) {
                if (eTypeAdapter.toConnectionType(connection.get('type')) === connectionType) {
                    if (connection.get('isSelected') !== isAllSelected) {
                        connection.set('isSelected', isAllSelected);
                    }
                }
            });
        };
        GroupedConnectionList.prototype._selectHandler = function (connectionRow) {
            var _this = this;
            var connection = connectionRow.get('model');
            if (!connection) {
                return;
            }
            var isSelected = !connection.get('isSelected');
            connection.set('isSelected', isSelected);
            var type = connection.get('type');
            var connectionType = eTypeAdapter.toConnectionType(type);
            var collection = this._listViews[connectionType].get('collection');
            collection.fetch().then(function (results) {
                _this._updateSelectAllState(type);
            });
        };
        GroupedConnectionList.prototype._toggleContactListGroup = function (connectionType, show) {
            this._containerNodes[connectionType].classList.toggle('is-hidden', !show);
        };
        GroupedConnectionList.prototype._render = function () {
            this._node = document.createElement('div');
            this._node.className = 'ContactList GroupedConnectionList';
            var wrapper = document.createElement('div');
            wrapper.className = 'ContactList-group';
            eTypeAdapter.forEachConnectionType(function (connectionType) {
                wrapper.appendChild(this._renderGroupedListNode(connectionType));
            }, this);
            this._node.appendChild(wrapper);
            this.on('pointerdown', this._rowSelectionHandler.bind(this));
        };
        return GroupedConnectionList;
    })(SearchWidget);
    return GroupedConnectionList;
});
//# sourceMappingURL=GroupedConnectionList.js.map