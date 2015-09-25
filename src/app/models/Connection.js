var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/PersistentModel'], function (require, exports, PersistentModel) {
    var Connection = (function (_super) {
        __extends(Connection, _super);
        function Connection() {
            _super.apply(this, arguments);
        }
        Connection.prototype._displayNameDependencies = function () {
            return ['account'];
        };
        Connection.prototype._displayNameGetter = function () {
            return this.get('account');
        };
        Connection.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._account = '';
            this._type = '';
            this._itemName = '';
            this._name = '';
        };
        return Connection;
    })(PersistentModel);
    Connection.setDefaultApp('app/main');
    return Connection;
});
//# sourceMappingURL=Connection.js.map