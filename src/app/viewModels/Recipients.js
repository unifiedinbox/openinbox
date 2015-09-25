var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Observable', 'mayhem/data/Proxy'], function (require, exports, Observable, Proxy) {
    var Recipients = (function (_super) {
        __extends(Recipients, _super);
        function Recipients() {
            _super.apply(this, arguments);
        }
        Recipients.prototype._recipientsGetter = function () {
            return this._recipients;
        };
        Recipients.prototype._recipientsSetter = function (collection) {
            this._recipients = Recipients.RecipientProxy.forCollection(collection);
        };
        return Recipients;
    })(Observable);
    var Recipients;
    (function (Recipients) {
        var RecipientProxy = (function (_super) {
            __extends(RecipientProxy, _super);
            function RecipientProxy() {
                _super.apply(this, arguments);
            }
            RecipientProxy.prototype._selectedConnectionTypeGetter = function () {
                return this.get('contact').get('accounts')[this.get('selectedAccount')].eType || '';
            };
            return RecipientProxy;
        })(Proxy);
        Recipients.RecipientProxy = RecipientProxy;
    })(Recipients || (Recipients = {}));
    return Recipients;
});
//# sourceMappingURL=Recipients.js.map