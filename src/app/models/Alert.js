var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/PersistentModel', 'dojo/_base/declare', 'dstore/Memory', 'dstore/Trackable'], function (require, exports, PersistentModel, declare, Memory, Trackable) {
    var Alert = (function (_super) {
        __extends(Alert, _super);
        function Alert(kwArgs) {
            _super.call(this, kwArgs);
            if (this.get('commitLabel') || this.get('undoLabel')) {
                this.set('isPermanent', true);
            }
        }
        Alert.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._message = '';
            this._command = null;
            this._commitLabel = '';
            this._undoLabel = '';
            this._isPermanent = false;
        };
        return Alert;
    })(PersistentModel);
    Alert.setDefaultApp('app/main');
    Alert.setDefaultStore(new (declare([Memory, Trackable]))({}));
    return Alert;
});
//# sourceMappingURL=Alert.js.map