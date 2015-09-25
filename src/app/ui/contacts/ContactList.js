var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/ListView', 'mayhem/routing/PathRegExp', 'mayhem/util', '../Avatar', './ContactRow', '../search/SearchWidget', '../../viewModels/SelectionManager', '../TooltipLabel'], function (require, exports, ListView, PathRegExp, util, Avatar, ContactRow, SearchWidget, SelectionManager, TooltipLabel) {
    var ContactList = (function (_super) {
        __extends(ContactList, _super);
        function ContactList(kwArgs) {
            util.deferSetters(this, ['collection', 'search', 'showConnectionTypes', 'value'], '_render');
            _super.call(this, kwArgs);
        }
        ContactList.prototype._isAttachedGetter = function () {
            return this._isAttached;
        };
        ContactList.prototype._isAttachedSetter = function (value) {
            this._listView.set('isAttached', value);
            this._isAttached = value;
        };
        ContactList.prototype._searchGetter = function () {
            return this._search;
        };
        ContactList.prototype._searchSetter = function (search) {
            if (search) {
                var value = PathRegExp.escape(search);
                var matcher = new RegExp(value, 'i');
                this._listView.set('collection', this._wrappedCollection.filter({ 'displayName': matcher }));
                this._selectionManager.reset();
            }
            else {
                this.set('collection', this._collection);
            }
            this._search = search;
        };
        ContactList.prototype._showSearchSetter = function (showSearch) {
            _super.prototype._showSearchSetter.call(this, showSearch);
            this.set('search', '');
        };
        ContactList.prototype._collectionGetter = function () {
            return this._collection;
        };
        ContactList.prototype._collectionSetter = function (collection) {
            this._collection = collection;
            if (!collection) {
                this._wrappedCollection = null;
            }
            else {
                this._wrappedCollection = this._selectionManager.wrapCollection(collection);
            }
            this._listView.set('collection', this._wrappedCollection);
            this._selectionManager.reset();
        };
        ContactList.prototype._selectionModeGetter = function () {
            return this._selectionManager.get('selectionMode');
        };
        ContactList.prototype._selectionModeSetter = function (mode) {
            this._selectionManager.set('selectionMode', mode);
        };
        ContactList.prototype._showConnectionTypesGetter = function () {
            return this._showConnectionTypes;
        };
        ContactList.prototype._showConnectionTypesSetter = function (showConnectionTypes) {
            this._node.classList.toggle('hide-connection-types', !showConnectionTypes);
        };
        ContactList.prototype._valueGetter = function () {
            return this._selectionManager.get('selectedCollection');
        };
        ContactList.prototype._valueSetter = function (value) {
            var collection = this.get('collection');
            this._selectionManager.reset();
            value = value || [];
            value.forEach(function (contact) {
                this._wrappedCollection.get(collection.getIdentity(contact)).then(function (item) {
                    item.set('isSelected', true);
                });
            }, this);
        };
        ContactList.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._showConnectionTypes = true;
            this._selectionManager = new SelectionManager();
        };
        ContactList.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._listView.destroy();
        };
        ContactList.prototype._rowSelectionHandler = function (event) {
            var contactRow;
            if (event.target instanceof Avatar || event.target instanceof TooltipLabel) {
                contactRow = event.target.get('parent');
            }
            else {
                contactRow = event.target;
            }
            var contact = contactRow.get('model');
            contact.set('isSelected', !contact.get('isSelected'));
        };
        ContactList.prototype._render = function () {
            this._node = document.createElement('div');
            this._node.className = 'ContactList with-SelectableItem';
            this._listView = new ListView({
                app: this.get('app'),
                parent: this,
                itemConstructor: ContactRow
            });
            this._listViewNode = this._listView.detach();
            this._listViewNode.classList.add('dgrid-autoheight');
            this._listViewNode.classList.add('ContactList-grid');
            this._node.appendChild(this._listViewNode);
            this.on('activate', this._rowSelectionHandler.bind(this));
        };
        return ContactList;
    })(SearchWidget);
    return ContactList;
});
//# sourceMappingURL=ContactList.js.map