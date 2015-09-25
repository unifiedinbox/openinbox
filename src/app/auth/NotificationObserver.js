var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Observable', 'mayhem/Promise'], function (require, exports, Observable, Promise) {
    var NotificationObserver = (function (_super) {
        __extends(NotificationObserver, _super);
        function NotificationObserver() {
            _super.apply(this, arguments);
        }
        NotificationObserver.prototype._queueGetter = function () {
            return this._queue.slice(0);
        };
        NotificationObserver.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._collection = null;
            this._queue = null;
        };
        NotificationObserver.prototype._initialize = function () {
            this._autoCommit = false;
            this._queue = [];
        };
        NotificationObserver.prototype.add = function (newData) {
            this._setQueue(this._queue.concat(newData));
            return Promise.resolve(this.get('queue'));
        };
        NotificationObserver.prototype.commit = function () {
            var notifications = this._queue;
            var Model = this._itemConstructor;
            var promises = [];
            for (var i = notifications.length; i--;) {
                var item = notifications[i].get('item');
                var model = (Model && !(item instanceof Model)) ? new Model(item) : item;
                promises.unshift(this._collection.put(model));
            }
            this._setQueue([], true);
            return Promise.all(promises);
        };
        NotificationObserver.prototype._setQueue = function (value, skipCommit) {
            if (skipCommit === void 0) { skipCommit = false; }
            var oldQueue = this.get('queue');
            this._queue = value;
            this._notify('queue', this.get('queue'), oldQueue);
            if (!skipCommit && this._autoCommit) {
                this.commit();
            }
        };
        return NotificationObserver;
    })(Observable);
    return NotificationObserver;
});
//# sourceMappingURL=NotificationObserver.js.map