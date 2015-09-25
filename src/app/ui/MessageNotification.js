var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'dojo/dom-class', 'mayhem/ui/dom/SingleNodeWidget', '../models/adapters/eType', 'mayhem/util'], function (require, exports, domClass, SingleNodeWidget, eTypeAdapter, util) {
    var MessageNotification = (function (_super) {
        __extends(MessageNotification, _super);
        function MessageNotification(kwArgs) {
            util.deferSetters(this, ['notifications', 'state'], '_render');
            _super.call(this, kwArgs);
        }
        MessageNotification.prototype._notificationsGetter = function () {
            return this._notifications;
        };
        MessageNotification.prototype._notificationsSetter = function (value) {
            this._notifications = value;
            if (value) {
                this.set('state', (this.get('total') > 0) ? 'displayed' : 'hidden');
                this._renderCounts();
                this._registerBindings();
            }
        };
        MessageNotification.prototype._stateGetter = function () {
            return this._state;
        };
        MessageNotification.prototype._stateSetter = function (state) {
            this._state = state;
            domClass.toggle(this._node, 'is-hidden', state === 'hidden');
        };
        MessageNotification.prototype._totalGetter = function () {
            return this._notifications ? this._notifications.get('queue').length : 0;
        };
        MessageNotification.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._notifications = null;
            this._typeCountNodes = null;
            this._totalCountNode = null;
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        MessageNotification.prototype.getTotalText = function () {
            var messages = this.get('app').get('i18n').get('messages');
            return messages.newMessagesCount({ NUM: this.get('total') });
        };
        MessageNotification.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._bindingHandles = [];
            this._typeCountNodes = {};
            this.set({
                state: 'hidden'
            });
        };
        MessageNotification.prototype._render = function () {
            this._node = document.createElement('div');
            domClass.add(this._node, 'MessageNotification');
            this._registerEvents();
        };
        MessageNotification.prototype._getTypeCounts = function () {
            var notifications = this._notifications.get('queue');
            return notifications.reduce(function (counts, notification) {
                var message = notification.get('item');
                var connectionType = eTypeAdapter.toConnectionType(message.get('connectionType'));
                if (!counts[connectionType]) {
                    counts[connectionType] = 0;
                }
                counts[connectionType] += 1;
                return counts;
            }, {});
        };
        MessageNotification.prototype._renderCounts = function () {
            var _this = this;
            var counts = this._getTypeCounts();
            var totalNode = document.createElement('span');
            totalNode.className = 'MessageNotification-total';
            this._totalCountNode = document.createTextNode(this.getTotalText());
            totalNode.appendChild(this._totalCountNode);
            this._node.appendChild(totalNode);
            eTypeAdapter.forEachConnectionType(function (type) {
                _this._renderTypeCount(type, counts[type] || 0);
            });
        };
        MessageNotification.prototype._renderTypeCount = function (type, count) {
            var countNode = document.createElement('span');
            var textNode = this._typeCountNodes[type] = document.createTextNode(String(count));
            domClass.add(countNode, 'MessageNotification-connection');
            domClass.add(countNode, 'connection-' + type);
            if (count === 0) {
                domClass.add(countNode, 'is-hidden');
            }
            countNode.appendChild(textNode);
            this._node.appendChild(countNode);
            return textNode;
        };
        MessageNotification.prototype._registerBindings = function () {
            var binder = this.get('app').get('binder');
            var binding = binder.createBinding(this._notifications, 'queue');
            var self = this;
            this._bindingHandles.push(binding.observe(function (change) {
                var total = self.get('total');
                var counts = self._getTypeCounts();
                self._totalCountNode.nodeValue = self.getTotalText();
                self.set('state', total > 0 ? 'displayed' : 'hidden');
                eTypeAdapter.forEachConnectionType(function (type) {
                    var typeCount = counts[type] || 0;
                    var typeNode = self._typeCountNodes[type];
                    typeNode.nodeValue = String(typeCount);
                    domClass.toggle(typeNode.parentNode, 'is-hidden', typeCount < 1);
                });
            }));
        };
        MessageNotification.prototype._registerEvents = function () {
            var _this = this;
            this.on('activate', function (event) {
                var totalNode = _this._totalCountNode.parentNode;
                totalNode.classList.add('is-pending');
                _this._notifications.commit().then(function () {
                    totalNode.classList.remove('is-pending');
                });
            });
        };
        return MessageNotification;
    })(SingleNodeWidget);
    return MessageNotification;
});
//# sourceMappingURL=MessageNotification.js.map