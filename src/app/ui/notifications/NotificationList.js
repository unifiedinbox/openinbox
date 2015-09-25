var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Event', 'mayhem/ui/dom/ListView', '../../viewModels/NotificationList', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util', "mayhem/templating/html!./NotificationRow.html"], function (require, exports, Event, ListView, NotificationProxy, SingleNodeWidget, util) {
    var NotificationRow = require('mayhem/templating/html!./NotificationRow.html');
    NotificationRow.prototype.selectNotification = function (event) {
        if (event.target.get('id') !== 'toggleStatus') {
            this.emit(new Event({
                type: 'notification-selected',
                bubbles: true,
                cancelable: false,
                target: this
            }));
        }
    };
    NotificationRow.prototype.toggleStatus = function (event) {
        var model = this.get('model');
        model.set('isRead', !model.get('isRead'));
    };
    var MarkAllAsReadButton = (function (_super) {
        __extends(MarkAllAsReadButton, _super);
        function MarkAllAsReadButton() {
            _super.apply(this, arguments);
        }
        MarkAllAsReadButton.prototype._render = function () {
            var app = this.get('app');
            var textNode = document.createTextNode(app.get('i18n').get('messages').markAllAsRead());
            this._node = document.createElement('a');
            this._node.classList.add('NotificationList-markAllAsRead');
            this._node.appendChild(textNode);
        };
        return MarkAllAsReadButton;
    })(SingleNodeWidget);
    var NotificationList = (function (_super) {
        __extends(NotificationList, _super);
        function NotificationList(kwArgs) {
            util.deferSetters(this, ['collection'], '_render');
            _super.call(this, kwArgs);
        }
        NotificationList.prototype._collectionGetter = function () {
            return this._collection;
        };
        NotificationList.prototype._collectionSetter = function (collection) {
            if (collection) {
                this._collection = NotificationProxy.forCollection(collection.sort('date', true));
                this._listView.set('collection', this._collection);
            }
        };
        NotificationList.prototype._isAttachedSetter = function (value) {
            this._listView.set('isAttached', value);
            this._isAttached = value;
        };
        NotificationList.prototype.markAllAsRead = function () {
            return this._collection.forEach(function (item) {
                item.set('isRead', true);
            });
        };
        NotificationList.prototype._render = function () {
            var app = this.get('app');
            this._node = document.createElement('div');
            this._node.classList.add('NotificationList-container');
            this._renderListView();
            this._markAllAsReadButton = new MarkAllAsReadButton({
                app: app,
                parent: this
            });
            this._node.appendChild(this._markAllAsReadButton.detach());
            this._registerEvents();
        };
        NotificationList.prototype._renderListView = function () {
            var app = this.get('app');
            var listViewNode;
            this._listView = new ListView({
                app: app,
                itemConstructor: NotificationRow,
                parent: this
            });
            listViewNode = this._listView.detach();
            listViewNode.classList.add('dgrid-autoheight');
            listViewNode.classList.add('NotificationList');
            this._node.appendChild(listViewNode);
        };
        NotificationList.prototype._registerEvents = function () {
            var self = this;
            this.on('activate', function (event) {
                if (event.target === self._markAllAsReadButton) {
                    event.preventDefault();
                    self.markAllAsRead();
                }
            });
        };
        return NotificationList;
    })(SingleNodeWidget);
    return NotificationList;
});
//# sourceMappingURL=NotificationList.js.map