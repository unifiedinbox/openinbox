var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'dojo/request', 'mayhem/has', 'mayhem/Observable', '../endpoints', './NotificationObserver', '../models/adapters/getNotifications', '../models/Comment', '../models/Message', '../models/Notification', './connections/Strophe'], function (require, exports, request, has, Observable, endpoints, NotificationObserver, adapters, Comment, Message, Notification, Strophe) {
    var apiTypeMap = {
        'newMsgNotification': 'message',
        'Mention': 'mention'
    };
    var NotificationManager = (function (_super) {
        __extends(NotificationManager, _super);
        function NotificationManager(kwArgs) {
            _super.call(this, kwArgs);
            this._setObservers();
            this._setConnection();
            if (this._startOnInitialize) {
                this.start();
            }
        }
        NotificationManager.prototype.add = function (data) {
            var type = data.type;
            var observer = this._notificationObservers[type];
            var notification = new Notification(data);
            if (observer) {
                observer.add(notification);
            }
            return Notification.store.put(notification);
        };
        NotificationManager.prototype.destroy = function () {
            var _this = this;
            _super.prototype.destroy.call(this);
            this._connection.destroy();
            Object.keys(this._notificationObservers).forEach(function (key) {
                _this._notificationObservers[key].destroy();
            });
        };
        NotificationManager.prototype._initialize = function () {
            this._isWatching = false;
            this._notificationObservers = (has('es5') ? Object.create(null) : {});
            this._startOnInitialize = true;
        };
        NotificationManager.prototype.start = function () {
            this.set('isWatching', true);
            this._connection.connect();
        };
        NotificationManager.prototype.stop = function () {
            this.set('isWatching', false);
            this._connection.disconnect();
        };
        NotificationManager.prototype._formatResponse = function (data) {
            var type = data.type;
            var observerType = apiTypeMap[type];
            var adapter = adapters[observerType];
            return this.add({
                id: data.id,
                type: observerType,
                isRead: data.isRead,
                item: adapter ? adapter(data) : data
            });
        };
        NotificationManager.prototype._loadNotification = function (message) {
            var app = this.get('app');
            var user = app.get('user');
            return request.post(endpoints.notifications, {
                handleAs: 'json',
                headers: {
                    apikey: app.get('apikey'),
                    app: user.get('uibApplication'),
                    sessionId: user.get('sessionId')
                },
                data: {
                    limit: 1,
                    seeAllNotifications: false
                }
            }).then(this._formatResponse.bind(this));
        };
        NotificationManager.prototype._setConnection = function () {
            this._connection = new Strophe({
                connectionData: this._connectionData,
                responseHandles: {
                    message: [this._loadNotification.bind(this)]
                }
            });
        };
        NotificationManager.prototype._setObservers = function () {
            var app = this.get('app');
            var observers = this._notificationObservers;
            observers.message = new NotificationObserver({
                app: app,
                itemConstructor: Message,
                collection: Message.store
            });
            observers.mention = new NotificationObserver({
                app: app,
                itemConstructor: Comment,
                collection: Comment.store
            });
            app.set('notifications', observers);
        };
        return NotificationManager;
    })(Observable);
    return NotificationManager;
});
//# sourceMappingURL=NotificationManager.js.map