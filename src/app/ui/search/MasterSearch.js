var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../../viewModels/MasterSearch', '../contacts/ContactRow', 'mayhem/Event', 'dojo/_base/lang', 'mayhem/ui/dom/ListView', './NavigableSearchWidget', 'mayhem/util'], function (require, exports, ContactProxy, ContactRow, Event, lang, ListView, SearchWidget, util) {
    var SearchableContactRow = (function (_super) {
        __extends(SearchableContactRow, _super);
        function SearchableContactRow() {
            _super.apply(this, arguments);
        }
        SearchableContactRow.prototype._render = function () {
            _super.prototype._render.call(this);
            this._registerEvents();
        };
        SearchableContactRow.prototype._registerBindings = function () {
            var app = this.get('app');
            var binder = app.get('binder');
            var self = this;
            _super.prototype._registerBindings.call(this);
            this._bindingHandles.push(binder.createBinding(this.get('model'), 'isHighlighted').observe(function (change) {
                self._node.classList.toggle('is-highlighted', change.value);
            }));
        };
        SearchableContactRow.prototype._registerEvents = function () {
            var _this = this;
            this.on('activate', function (event) {
                _this.emit(new Event({
                    type: 'searchableContactRowSelect',
                    bubbles: true,
                    cancelable: false,
                    target: _this
                }));
            });
        };
        return SearchableContactRow;
    })(ContactRow);
    var SearchableContactRow;
    (function (SearchableContactRow) {
        ;
        ;
    })(SearchableContactRow || (SearchableContactRow = {}));
    var MasterSearch = (function (_super) {
        __extends(MasterSearch, _super);
        function MasterSearch(kwArgs) {
            util.deferSetters(this, ['collection', 'resultsClass', 'search'], '_render');
            _super.call(this, kwArgs);
        }
        MasterSearch.prototype._collectionGetter = function () {
            return this._collection;
        };
        MasterSearch.prototype._collectionSetter = function (value) {
            if (value) {
                this._collection = ContactProxy.forCollection(value);
                this._listView.set('collection', this._collection);
            }
        };
        MasterSearch.prototype._isAttachedSetter = function (value) {
            _super.prototype._isAttachedSetter.call(this, value);
            this._listView.set('isAttached', value);
        };
        MasterSearch.prototype._resultsClassGetter = function () {
            return this._resultsClass;
        };
        MasterSearch.prototype._resultsClassSetter = function (value) {
            var node = this._listView.get('firstNode');
            var previous = this._resultsClass;
            this._resultsClass = value;
            if (previous) {
                node.classList.remove(previous);
            }
            if (value) {
                node.classList.add(value);
            }
        };
        MasterSearch.prototype._searchSetter = function (search) {
            var self = this;
            this._search = search;
            if (this._isAttached) {
                this.hideList();
                var searchResults = this._filterSearchResults(search);
                this._listView.set('collection', searchResults);
                this._searchResults = searchResults.fetch();
                this._emit('masterSearchChange');
                this._searchResults.then(function (contacts) {
                    self._searchResultsNode.classList.toggle('is-hidden', !search.length || !contacts.length);
                });
            }
        };
        MasterSearch.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._listView.destroy();
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        MasterSearch.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._bindingHandles = [];
            this.set({
                hasPointerFocus: false,
                showSearch: true,
            });
        };
        MasterSearch.prototype._render = function () {
            this._node = document.createElement('div');
            this._node.classList.add('MasterSearch');
            this._renderListView();
            this._registerBindings();
            this._registerEvents();
        };
        MasterSearch.prototype._emit = function (type, options) {
            if (type) {
                this.emit(new Event(lang.mixin({
                    type: type,
                    bubbles: true,
                    cancelable: false,
                    target: this
                }, options)));
            }
        };
        MasterSearch.prototype._filterSearchResults = function (search) {
            var pattern = new RegExp('(^|\\s)' + search.replace(/\\/g, '\\\\'), 'i');
            return this._collection.filter(function (contact) {
                return pattern.test(contact.get('displayName'));
            });
        };
        MasterSearch.prototype._getSearchInputValue = function (contact) {
            return contact.get('displayName');
        };
        MasterSearch.prototype._registerBindings = function () {
            var _this = this;
            var app = this.get('app');
            var binder = app.get('binder');
            this._bindingHandles.push(binder.createBinding(this, 'isFocused').observe(function (change) {
                _this._emit('masterSearchFocus');
                if (_this._searchResultsNode) {
                    if (!change.value && !_this._hasPointerFocus) {
                        _this._searchResultsNode.classList.add('is-hidden');
                    }
                    else if (_this._searchResults) {
                        _this._searchResults.then(function (contacts) {
                            _this._searchResultsNode.classList.toggle('is-hidden', (!_this.get('search') || !contacts.length));
                        });
                    }
                }
            }));
        };
        MasterSearch.prototype._registerEvents = function () {
            var _this = this;
            this.on('searchSubmit', function (event) {
                event.stopPropagation();
                _this._emit('masterSearchSubmit');
            });
            this.on('searchableContactRowSelect', function (event) {
                event.stopPropagation();
                _this._emit('searchResultSelected', { target: event.target, item: event.target.get('model') });
            });
            this.on('pointerenter', function (event) {
                _this._hasPointerFocus = true;
            });
            this.on('pointerleave', function (event) {
                _this._hasPointerFocus = false;
            });
        };
        MasterSearch.prototype._renderListView = function () {
            var listView = new ListView({
                app: this.get('app'),
                parent: this,
                itemConstructor: SearchableContactRow,
                sort: 'displayName'
            });
            var listViewNode = listView.detach();
            this._searchResultsNode = listViewNode;
            listViewNode.className = 'ContactList ContactList--autocomplete dgrid-autoheight is-hidden';
            this._listView = listView;
            this._node.appendChild(listViewNode);
        };
        return MasterSearch;
    })(SearchWidget);
    var MasterSearch;
    (function (MasterSearch) {
        ;
        ;
    })(MasterSearch || (MasterSearch = {}));
    return MasterSearch;
});
//# sourceMappingURL=MasterSearch.js.map