var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/Proxy'], function (require, exports, Proxy) {
    var ContactProxy = (function (_super) {
        __extends(ContactProxy, _super);
        function ContactProxy() {
            _super.apply(this, arguments);
        }
        ContactProxy.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._isHighlighted = false;
        };
        return ContactProxy;
    })(Proxy);
    var ContactProxy;
    (function (ContactProxy) {
        ;
        ;
    })(ContactProxy || (ContactProxy = {}));
    return ContactProxy;
});
//# sourceMappingURL=MasterSearch.js.map