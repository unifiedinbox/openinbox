var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/Proxy'], function (require, exports, Proxy) {
    var FolderProxy = (function (_super) {
        __extends(FolderProxy, _super);
        function FolderProxy() {
            _super.apply(this, arguments);
        }
        FolderProxy.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this.set('isHighlighted', false);
        };
        return FolderProxy;
    })(Proxy);
    return FolderProxy;
});
//# sourceMappingURL=FolderList.js.map