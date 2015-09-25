var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Observable'], function (require, exports, Observable) {
    var Loading = (function (_super) {
        __extends(Loading, _super);
        function Loading() {
            _super.apply(this, arguments);
        }
        Loading.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._author = '';
            this._message = '';
        };
        return Loading;
    })(Observable);
    return Loading;
});
//# sourceMappingURL=Loading.js.map