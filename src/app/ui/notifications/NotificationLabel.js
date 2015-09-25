var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util'], function (require, exports, SingleNodeWidget, util) {
    var NotificationLabel = (function (_super) {
        __extends(NotificationLabel, _super);
        function NotificationLabel(kwArgs) {
            util.deferSetters(this, ['notificationCount', 'collection'], '_render');
            _super.call(this, kwArgs);
        }
        NotificationLabel.prototype._collectionGetter = function () {
            return this._collection;
        };
        NotificationLabel.prototype._collectionSetter = function (collection) {
            var _this = this;
            if (collection) {
                this._collection = collection;
                this._setNotificationCount();
                collection.on('add,update,delete', function (event) {
                    _this._setNotificationCount();
                });
            }
        };
        NotificationLabel.prototype._notificationCountGetter = function () {
            return this._notificationCount;
        };
        NotificationLabel.prototype._notificationCountSetter = function (count) {
            var node = this._notificationCountSpan;
            this._notificationCount = count;
            if (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            node.appendChild(document.createTextNode(String(count)));
            node.classList.toggle('is-hidden', !count);
        };
        NotificationLabel.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this.set('notificationCount', 0);
        };
        NotificationLabel.prototype._render = function () {
            this._node = document.createElement('div');
            this._node.className = 'icon-app-reminder';
            this._notificationCountSpan = document.createElement('span');
            this._notificationCountSpan.className = 'Notification-count';
            this._node.appendChild(this._notificationCountSpan);
        };
        NotificationLabel.prototype._setNotificationCount = function () {
            var self = this;
            this._collection.filter({ isRead: false }).fetch().then(function (notifications) {
                self.set('notificationCount', notifications.length);
            });
        };
        return NotificationLabel;
    })(SingleNodeWidget);
    return NotificationLabel;
});
//# sourceMappingURL=NotificationLabel.js.map