var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../../util', 'mayhem/Event', 'mayhem/ui/Label', '../../models/Message', '../../viewModels/QuickReply', 'mayhem/ui/dom/MultiNodeWidget', '../util', 'mayhem/util', "mayhem/templating/html!./AttachmentPreviews.html", "mayhem/templating/html!./QuickReply.html"], function (require, exports, appUtil, Event, Label, Message, MessageProxy, MultiNodeWidget, uiUtil, util) {
    var AttachmentsWidget = require('mayhem/templating/html!./AttachmentPreviews.html');
    var Template = require('mayhem/templating/html!./QuickReply.html');
    var QuickReply = (function (_super) {
        __extends(QuickReply, _super);
        function QuickReply(kwArgs) {
            util.deferSetters(this, ['isOpen', 'message'], '_render');
            _super.call(this, kwArgs);
        }
        QuickReply.prototype._isAttachedSetter = function (value) {
            this._isAttached = value;
            this._widget.set('isAttached', value);
        };
        QuickReply.prototype._isOpenGetter = function () {
            return this._isOpen;
        };
        QuickReply.prototype._isOpenSetter = function (value) {
            this._isOpen = value;
            if (!value) {
                this.set('message', this._message.get('source'));
            }
        };
        QuickReply.prototype._messageGetter = function () {
            return this._message;
        };
        QuickReply.prototype._messageSetter = function (value) {
            if (value) {
                this._message = new MessageProxy({
                    app: this.get('app'),
                    source: value,
                    target: Message.getReplyMessage(value)
                });
                this._widget.set('model', this._message);
                this._renderAttachments();
                this._messageHandle && this._messageHandle.remove();
                this._messageHandle = this.get('app').get('binder').bind({
                    source: this,
                    sourcePath: 'replyType',
                    target: this._message,
                    targetPath: 'replyType'
                });
            }
        };
        QuickReply.prototype.delete = function () {
            this._emit('quickReplyDelete');
        };
        QuickReply.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._widget.destroy();
            this._message = null;
            this._messageHandle && this._messageHandle.remove();
        };
        QuickReply.prototype.expand = function () {
            this._emit('messageCompose');
        };
        QuickReply.prototype.forward = function () {
            this._emit('messageCompose', 'forward');
        };
        QuickReply.prototype._render = function () {
            _super.prototype._render.call(this);
            this._widget = new Template({
                app: this.get('app'),
                parent: this
            });
            var lastNode = this.get('lastNode');
            lastNode.parentNode.insertBefore(this._widget.detach(), lastNode);
            this._delegateEvents();
            this._registerEvents();
        };
        QuickReply.prototype.send = function () {
            var moveToFolder = this._message.get('selectedFolder');
            this.set('isOpen', false);
            this._emit('messageSend');
            if (moveToFolder) {
                this._message.get('source').set('folderId', moveToFolder.get('id'));
            }
        };
        QuickReply.prototype.toggleMoveToFolder = function () {
            this._message.set('moveToFolder', !this._message.get('moveToFolder'));
        };
        QuickReply.prototype._delegateEvents = function () {
            var _this = this;
            ['expand', 'forward', 'send', 'delete', 'toggleMoveToFolder'].forEach(function (method) {
                _this._widget[method] = _this[method].bind(_this);
            });
        };
        QuickReply.prototype._emit = function (type, action) {
            if (type) {
                this.emit(new QuickReply.SendEvent({
                    type: type,
                    bubbles: true,
                    cancelable: false,
                    target: this,
                    message: this._message.get('target'),
                    action: action || null
                }));
            }
        };
        QuickReply.prototype._handleFolderSelection = function (event) {
            var folder = event.target.get('model');
            var message = this.get('message');
            event.stopPropagation();
            message.set('selectedFolder', folder);
            uiUtil.closeDropDowns(event.target);
        };
        QuickReply.prototype._handleReplyMenuAction = function (event) {
            var target = event.target;
            if (!(target instanceof Label)) {
                return;
            }
            var message = this.get('message');
            var action = target.get('action');
            if (action in { reply: 1, replyAll: 1, forward: 1 }) {
                uiUtil.closeDropDowns(target);
            }
            if (action === 'forward') {
                this.forward();
                return;
            }
            message.set('replyType', (action === 'replyAll') ? 1 /* ReplyAll */ : 0 /* Reply */);
        };
        QuickReply.prototype._registerEvents = function () {
            this.on('activate', this._handleReplyMenuAction.bind(this));
            this.on('updateRecipients', this._updateRecipients.bind(this));
            this.on('folderSelected', this._handleFolderSelection.bind(this));
        };
        QuickReply.prototype._renderAttachments = function () {
            this._widget.set('attachmentsWidget', new AttachmentsWidget({
                app: this.get('app'),
                parent: this,
                model: this._message.get('attachmentsModel')
            }));
        };
        QuickReply.prototype._updateRecipients = function (event) {
            var _this = this;
            var recipients = event.target.get('value');
            recipients.fetch().then(function (contactProxies) {
                var contacts = contactProxies.map(appUtil.getProxyTarget);
                var message = _this.get('message');
                message.set({
                    selectedRecipients: contacts,
                    to: contacts.map(function (contact) {
                        return contact.get('displayName');
                    })
                });
            });
        };
        return QuickReply;
    })(MultiNodeWidget);
    var QuickReply;
    (function (QuickReply) {
        var SendEvent = (function (_super) {
            __extends(SendEvent, _super);
            function SendEvent() {
                _super.apply(this, arguments);
            }
            return SendEvent;
        })(Event);
        QuickReply.SendEvent = SendEvent;
    })(QuickReply || (QuickReply = {}));
    return QuickReply;
});
//# sourceMappingURL=QuickReply.js.map