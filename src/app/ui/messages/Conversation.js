var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../conversations/ConversationList', 'mayhem/Event', '../../models/Message', './MessageActions', '../../viewModels/MessageActions', '../MessageNotification', '../../viewModels/MessageList', './MessageRow', 'mayhem/Observable', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util', "mayhem/templating/html!./ConversationActions.html"], function (require, exports, ConversationList, Event, Message, MessageActions, MessageActionsViewModel, MessageNotification, MessageProxy, MessageRow, Observable, SingleNodeWidget, util) {
    var ConversationActions = require('mayhem/templating/html!./ConversationActions.html');
    var ConversationView = (function (_super) {
        __extends(ConversationView, _super);
        function ConversationView(kwArgs) {
            util.deferSetters(this, ['collection', 'message', 'notifications'], '_render');
            _super.call(this, kwArgs);
        }
        ConversationView.prototype._collectionGetter = function () {
            return this._collection;
        };
        ConversationView.prototype._collectionSetter = function (value) {
            this._collection = value;
            if (value) {
                this._conversationList.set('collection', value);
            }
        };
        ConversationView.prototype._isAttachedSetter = function (value) {
            this._isAttached = value;
            this._conversationActions.set('isAttached', value);
            this._conversationList.set('isAttached', value);
            this._messageNotification.set('isAttached', value);
            this._messageRow.set('isAttached', value);
        };
        ConversationView.prototype._messageGetter = function () {
            return this._message;
        };
        ConversationView.prototype._messageSetter = function (value) {
            this._message = value;
            if (value) {
                var messageRowProxy = new MessageProxy({ target: value });
                this._messageRow.set('model', messageRowProxy);
                this._conversationList.set('message', value);
                this._messageActions.get('model').set('message', messageRowProxy);
                this._conversationActions.get('model').set('message', value);
            }
        };
        ConversationView.prototype._notificationsGetter = function () {
            return this._notifications;
        };
        ConversationView.prototype._notificationsSetter = function (value) {
            this._notifications = value;
            if (value) {
                this._messageNotification.set('notifications', value);
            }
        };
        ConversationView.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._conversationActions.destroy();
            this._conversationList.destroy();
            this._messageNotification.destroy();
            this._messageRow.destroy();
        };
        ConversationView.prototype.forward = function () {
            this.emit(new ConversationView.MessageEvent({
                type: 'messageCompose',
                bubbles: true,
                cancelable: false,
                target: this,
                source: this._message,
                action: 'forward',
            }));
        };
        ConversationView.prototype.reply = function () {
            this._conversationActions.get('model').set({
                replyType: 0 /* Reply */,
                showQuickReply: true
            });
        };
        ConversationView.prototype.replyAll = function () {
            this._conversationActions.get('model').set({
                replyType: 1 /* ReplyAll */,
                showQuickReply: true
            });
        };
        ConversationView.prototype.reset = function () {
            this._conversationActions.get('model').set('showQuickReply', false);
        };
        ConversationView.prototype._render = function () {
            var app = this.get('app');
            this._node = document.createElement('div');
            this._node.className = 'Conversation';
            this._messageRow = new MessageRow({
                app: app,
                parent: this
            });
            this._messageActions = new MessageActions({
                app: app,
                parent: this._messageRow,
                model: new MessageActionsViewModel({
                    app: app,
                    isOpen: false
                })
            });
            this._messageRow.set('messageActions', this._messageActions);
            this._conversationList = new ConversationList({
                app: app,
                parent: this
            });
            this._messageNotification = new MessageNotification({
                app: app,
                parent: this
            });
            this._conversationActions = new ConversationActions({
                app: app,
                parent: this,
                model: new Observable({
                    app: app,
                    showQuickReply: false
                })
            });
            this._node.appendChild(this._messageRow.detach());
            this._node.appendChild(this._conversationList.detach());
            this._node.appendChild(this._messageNotification.detach());
            this._node.appendChild(this._conversationActions.detach());
            this._registerEvents();
        };
        ConversationView.prototype._registerEvents = function () {
            var _this = this;
            this.on('messageRowPointerEnter', function (event) {
                _this._messageActions.get('model').set('isOpen', true);
            });
            this.on('messageRowPointerLeave', function (event) {
                _this._messageActions.get('model').set('isOpen', false);
            });
            this.on('messageSend', function (event) {
                _this._conversationActions.get('model').set('showQuickReply', false);
            });
            this._conversationActions.on('activate', function (event) {
                var label = event.target;
                var action = label.get('action');
                var method = action && _this[action];
                if (typeof method === 'function') {
                    event.stopPropagation();
                    method.call(_this);
                }
            });
        };
        return ConversationView;
    })(SingleNodeWidget);
    var ConversationView;
    (function (ConversationView) {
        var MessageEvent = (function (_super) {
            __extends(MessageEvent, _super);
            function MessageEvent() {
                _super.apply(this, arguments);
            }
            return MessageEvent;
        })(Event);
        ConversationView.MessageEvent = MessageEvent;
    })(ConversationView || (ConversationView = {}));
    return ConversationView;
});
//# sourceMappingURL=Conversation.js.map