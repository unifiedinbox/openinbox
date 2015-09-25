var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Observable', 'mayhem/data/Proxy', 'dojo/_base/declare', 'dstore/Memory', 'dstore/Trackable'], function (require, exports, Observable, Proxy, declare, Memory, Trackable) {
    var SelectionManager = (function (_super) {
        __extends(SelectionManager, _super);
        function SelectionManager() {
            _super.apply(this, arguments);
        }
        SelectionManager.prototype._hasSelectionsDependencies = function () {
            return ['selectedCollection'];
        };
        SelectionManager.prototype._hasSelectionsGetter = function () {
            return this._selectedCollection.fetchSync().length > 0;
        };
        SelectionManager.prototype._selectionModeGetter = function () {
            return this._selectionMode;
        };
        SelectionManager.prototype._selectionModeSetter = function (mode) {
            this._selectionMode = mode;
            this.reset();
        };
        SelectionManager.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._selectionMode = 1 /* multiple */;
            this._selectedCollection = new (declare([Memory, Trackable]))();
        };
        SelectionManager.prototype.processSelection = function (item, isSelected) {
            var isSingle = this.get('selectionMode') === 0 /* single */;
            if (isSingle) {
                if (isSelected) {
                    this.reset();
                }
            }
            if (isSelected) {
                this._selectedCollection.put(item);
            }
            else {
                this._selectedCollection.remove(this._selectedCollection.getIdentity(item));
            }
        };
        SelectionManager.prototype.reset = function () {
            return this._selectedCollection.fetch().then(function (results) {
                for (var i = results.length; i--;) {
                    results[i].set('isSelected', false);
                }
            });
        };
        SelectionManager.prototype.wrapCollection = function (collection) {
            var self = this;
            function SelectableProxy(kwArgs) {
                SelectionManager.SelectableProxy.call(this, kwArgs);
                this.set('selectionManager', self);
            }
            __extends(SelectableProxy, SelectionManager.SelectableProxy);
            var forCollection = SelectionManager.SelectableProxy.forCollection;
            var wrapperCollection = forCollection.call(SelectableProxy, collection);
            return wrapperCollection;
        };
        return SelectionManager;
    })(Observable);
    var SelectionManager;
    (function (SelectionManager) {
        (function (SelectionMode) {
            SelectionMode[SelectionMode["single"] = 0] = "single";
            SelectionMode[SelectionMode["multiple"] = 1] = "multiple";
        })(SelectionManager.SelectionMode || (SelectionManager.SelectionMode = {}));
        var SelectionMode = SelectionManager.SelectionMode;
        ;
        var SelectableProxy = (function (_super) {
            __extends(SelectableProxy, _super);
            function SelectableProxy() {
                _super.apply(this, arguments);
            }
            SelectableProxy.prototype._isSelectedGetter = function () {
                return this._isSelected;
            };
            SelectableProxy.prototype._isSelectedSetter = function (isSelected) {
                this.get('selectionManager').processSelection(this, isSelected);
                this._isSelected = isSelected;
            };
            SelectableProxy.prototype._initialize = function () {
                _super.prototype._initialize.call(this);
                this._isSelected = false;
                this._selectionManager = null;
            };
            return SelectableProxy;
        })(Proxy);
        SelectionManager.SelectableProxy = SelectableProxy;
    })(SelectionManager || (SelectionManager = {}));
    return SelectionManager;
});
//# sourceMappingURL=SelectionManager.js.map