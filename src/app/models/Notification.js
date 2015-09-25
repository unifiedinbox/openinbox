var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/PersistentModel', './stores/TrackableMemory'], function (require, exports, PersistentModel, TrackableMemory) {
    var Notification = (function (_super) {
        __extends(Notification, _super);
        function Notification() {
            _super.apply(this, arguments);
        }
        Notification.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._autoSave = true;
            this._isRead = false;
            this._type = '';
        };
        return Notification;
    })(PersistentModel);
    var Notification;
    (function (Notification) {
        ;
        ;
    })(Notification || (Notification = {}));
    Notification.setDefaultApp('app/main');
    Notification.setDefaultStore(new TrackableMemory());
    return Notification;
});
//# sourceMappingURL=Notification.js.map