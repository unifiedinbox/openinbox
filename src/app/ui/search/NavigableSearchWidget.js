var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Event', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/ui/form/Text', 'mayhem/util'], function (require, exports, Event, SingleNodeWidget, TextWidget, util) {
    var keyCodeMethodMap = {
        ArrowUp: 'previousRow',
        ArrowDown: 'nextRow',
        Enter: 'selectRow',
        Escape: 'hideList'
    };
    var SearchWidget = (function (_super) {
        __extends(SearchWidget, _super);
        function SearchWidget(kwArgs) {
            util.deferSetters(this, ['showSearch', 'searchPlaceholder'], '_render');
            _super.call(this, kwArgs);
        }
        SearchWidget.prototype._searchPlaceholderGetter = function () {
            return this._searchPlaceholder;
        };
        SearchWidget.prototype._searchPlaceholderSetter = function (value) {
            this._searchPlaceholder = value;
            this._searchInputWidget.set('placeholder', value);
        };
        SearchWidget.prototype._isAttachedGetter = function () {
            return this._isAttached;
        };
        SearchWidget.prototype._isAttachedSetter = function (value) {
            this._searchInputWidget && this._searchInputWidget.set('isAttached', value);
            this._isAttached = value;
        };
        SearchWidget.prototype._showSearchGetter = function () {
            return this._showSearch;
        };
        SearchWidget.prototype._showSearchSetter = function (showSearch) {
            if (showSearch) {
                if (!this._searchInputWidget) {
                    this._node.insertBefore(this._renderSearchNode(), this._node.firstChild);
                    var app = this.get('app');
                    var binder = app.get('binder');
                    this._searchBindings = [
                        binder.bind({
                            source: this._searchInputWidget,
                            sourcePath: 'value',
                            target: this,
                            targetPath: 'search'
                        }),
                        binder.bind({
                            source: this._searchInputWidget,
                            sourcePath: 'isFocused',
                            target: this,
                            targetPath: 'isFocused'
                        })
                    ];
                    this._searchInputWidget.on('keydown', this._handleSearchKeyboardEvent.bind(this));
                }
            }
            else {
                this._searchInputWidget.destroy();
                this._searchInputWidget = undefined;
                if (this._searchBindings) {
                    this._searchBindings.forEach(function (handle) {
                        handle.remove();
                    });
                }
            }
            this._showSearch = showSearch;
        };
        SearchWidget.prototype._searchGetter = function () {
            return this._search;
        };
        SearchWidget.prototype._searchSetter = function (search) {
            throw new Error('this method must be implemented');
        };
        SearchWidget.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._search = '';
            this._searchPlaceholder = '';
            this._searchResultsIndex = -1;
            this._showSearch = false;
        };
        SearchWidget.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._searchInputWidget && this._searchInputWidget.destroy();
        };
        SearchWidget.prototype._renderSearchNode = function () {
            var searchInput = new TextWidget({
                app: this.get('app'),
                placeholder: this._searchPlaceholder || this.get('app').get('i18n').get('messages').search(),
                autoCommit: true,
                parent: this
            });
            var searchNode = searchInput.detach();
            searchNode.classList.add('search-container');
            this._registerSearchResultEvents();
            this._searchInputWidget = searchInput;
            return searchNode;
        };
        SearchWidget.prototype.previousRow = function (event) {
            event && event.preventDefault();
            this._updateSearchIndex(-1);
        };
        SearchWidget.prototype.nextRow = function (event) {
            event && event.preventDefault();
            this._updateSearchIndex();
        };
        SearchWidget.prototype.selectRow = function (event, selectedValue) {
            var _this = this;
            this._searchResults && this._searchResults.then(function (items) {
                var index = selectedValue ? _this._getResultItemIndex(items, selectedValue) : _this._searchResultsIndex;
                var event = new SearchWidget.SearchEvent({
                    type: 'searchSubmit',
                    bubbles: true,
                    cancelable: false,
                    target: _this
                });
                if (index === -1) {
                    event.value = _this._searchInputWidget.get('value');
                }
                else {
                    items.forEach(function (item, i) {
                        item.set('isHighlighted', false);
                        if (i === index) {
                            var value = _this._getSearchInputValue(item);
                            _this._searchInputWidget.set('value', value);
                            event.item = item;
                            event.value = value;
                        }
                    });
                }
                _this.emit(event);
            });
            this._searchResults = null;
            this.hideList();
        };
        SearchWidget.prototype.hideList = function () {
            var index = this._searchResultsIndex;
            this._searchResultsIndex = -1;
            this._searchResultsNode.classList.add('is-hidden');
            this._searchResults && this._searchResults.then(function (items) {
                var previous = items[index];
                previous && previous.set('isHighlighted', false);
            });
        };
        SearchWidget.prototype._updateSearchIndex = function (increment) {
            if (increment === void 0) { increment = 1; }
            var self = this;
            this._searchResults.then(function (items) {
                var index = self._searchResultsIndex;
                var previous = items[index];
                self._searchResultsIndex = (Math.max(-1, index + increment) + items.length) % items.length;
                previous && previous.set('isHighlighted', false);
                items[self._searchResultsIndex].set('isHighlighted', true);
            });
        };
        SearchWidget.prototype._registerSearchResultEvents = function () {
            this.on('searchResultSelected', this._handleSearchResultsClick.bind(this));
        };
        SearchWidget.prototype._handleSearchKeyboardEvent = function (event) {
            var methodName;
            if (event.code === 'Enter' || !this._searchResultsNode.classList.contains('is-hidden')) {
                methodName = keyCodeMethodMap[event.code];
                if (methodName) {
                    this[methodName](event);
                }
            }
        };
        SearchWidget.prototype._handleSearchResultsClick = function (event) {
            var row = event.target;
            this.selectRow(event, this._getSearchInputValue(row.get('model')));
        };
        SearchWidget.prototype._getResultItemIndex = function (items, value) {
            for (var i = items.length; i--;) {
                var testValue = this._getSearchInputValue(items[i]);
                if (testValue === value) {
                    return i;
                }
            }
            return -1;
        };
        SearchWidget.prototype._getSearchInputValue = function (item) {
            throw new Error('Widget#_getSearchInputValue must be implemented.');
        };
        return SearchWidget;
    })(SingleNodeWidget);
    var SearchWidget;
    (function (SearchWidget) {
        var SearchEvent = (function (_super) {
            __extends(SearchEvent, _super);
            function SearchEvent() {
                _super.apply(this, arguments);
                this.item = null;
                this.value = '';
            }
            return SearchEvent;
        })(Event);
        SearchWidget.SearchEvent = SearchEvent;
    })(SearchWidget || (SearchWidget = {}));
    return SearchWidget;
});
//# sourceMappingURL=NavigableSearchWidget.js.map