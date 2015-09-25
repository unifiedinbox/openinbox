var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../../util', './Conversation', 'mayhem/ui/dom/Dialog', 'mayhem/util'], function (require, exports, appUtil, ConversationView, Dialog, util) {
    var ConversationDialog = (function (_super) {
        __extends(ConversationDialog, _super);
        function ConversationDialog(kwArgs) {
            util.deferSetters(this, ['collection', 'message', 'notifications'], '_render');
            _super.call(this, kwArgs);
        }
        ConversationDialog.prototype._collectionGetter = function () {
            return this._collection;
        };
        ConversationDialog.prototype._collectionSetter = function (value) {
            this._collection = value;
            if (value) {
                this._conversation.set('collection', value);
            }
        };
        ConversationDialog.prototype._isOpenSetter = function (value) {
            _super.prototype._isOpenSetter.call(this, value);
            if (value) {
                this._closeClickListener = this.get('app').get('ui').on('activate', this._closeClickHandler.bind(this));
            }
            else {
                this._conversation.reset();
                if (this._closeClickListener) {
                    this._closeClickListener.remove();
                    this._closeClickListener = null;
                }
            }
        };
        ConversationDialog.prototype._messageGetter = function () {
            return this._message;
        };
        ConversationDialog.prototype._messageSetter = function (value) {
            this._message = value;
            if (value) {
                this._conversation.set('message', value);
            }
        };
        ConversationDialog.prototype._notificationsGetter = function () {
            return this._notifications;
        };
        ConversationDialog.prototype._notificationsSetter = function (value) {
            this._notifications = value;
            if (value) {
                this._conversation.set('notifications', value);
            }
        };
        ConversationDialog.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this._closeClickListener) {
                this._closeClickListener.remove();
                this._closeClickListener = null;
            }
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        ConversationDialog.prototype._render = function () {
            _super.prototype._render.call(this);
            this._conversation = new ConversationView({
                app: this.get('app')
            });
            this.add(this._conversation);
            this.get('firstNode').classList.add('ConversationDialog');
        };
        ConversationDialog.prototype._closeClickHandler = function (event) {
            if (!appUtil.contains(this, event.target)) {
            }
        };
        return ConversationDialog;
    })(Dialog);
    return ConversationDialog;
});
//# sourceMappingURL=ConversationDialog.js.map