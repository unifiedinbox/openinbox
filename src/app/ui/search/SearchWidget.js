var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/ui/form/Text', 'mayhem/util'], function (require, exports, SingleNodeWidget, TextWidget, util) {
    var SearchWidget = (function (_super) {
        __extends(SearchWidget, _super);
        function SearchWidget(kwArgs) {
            util.deferSetters(this, ['showSearch'], '_render');
            _super.call(this, kwArgs);
        }
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
                    this._searchBinding = binder.bind({
                        source: this._searchInputWidget,
                        sourcePath: 'value',
                        target: this,
                        targetPath: 'search'
                    });
                }
            }
            else {
                this._searchInputWidget.destroy();
                this._searchInputWidget = undefined;
                if (this._searchBinding) {
                    this._searchBinding.remove();
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
            this._showSearch = false;
            this._search = '';
        };
        SearchWidget.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._searchInputWidget && this._searchInputWidget.destroy();
        };
        SearchWidget.prototype._renderSearchNode = function () {
            var searchInput = new TextWidget({
                app: this.get('app'),
                placeholder: this.get('app').get('i18n').get('messages').search(),
                autoCommit: true,
                parent: this
            });
            var searchNode = searchInput.detach();
            searchNode.classList.add('search-container');
            this._searchInputWidget = searchInput;
            return searchNode;
        };
        return SearchWidget;
    })(SingleNodeWidget);
    return SearchWidget;
});
//# sourceMappingURL=SearchWidget.js.map