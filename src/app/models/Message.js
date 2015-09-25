var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './Folder', 'mayhem/data/PersistentModel'], function (require, exports, Folder, PersistentModel) {
    var listViewScenario = [
        'folderId',
        'isBlacklisted',
        'isJunk',
        'isRead',
        'isStarred',
        'labels',
        'priority',
        'privacyStatus',
    ];
    var newScenario = [
        'attachments',
        'bcc',
        'body',
        'cc',
        'connectionType',
        'folderId',
        'format',
        'from',
        'hasAttachment',
        'labels',
        'messageType',
        'priority',
        'privacyStatus',
        'readReceipt',
        'replyTo',
        'subject',
        'to'
    ];
    var forwardScenario = [
        'attachments',
        'bcc',
        'body',
        'cc',
        'connectionType',
        'folderId',
        'format',
        'forwarded',
        'from',
        'hasAttachment',
        'labels',
        'messageType',
        'priority',
        'privacyStatus',
        'readReceipt',
        'replyTo',
        'sourceId',
        'subject',
        'to'
    ];
    var replyScenario = [
        'attachments',
        'bcc',
        'body',
        'cc',
        'connectionType',
        'folderId',
        'format',
        'from',
        'hasAttachment',
        'labels',
        'messageType',
        'priority',
        'privacyStatus',
        'readReceipt',
        'replied',
        'replyTo',
        'sourceId',
        'subject',
        'to'
    ];
    var replyCloneProperties = [
        'connectionType',
        'folderId',
        'format',
        'hasAttachment',
        'labels',
        'messageType',
        'priority',
        'privacyStatus',
        'sourceId',
        'subject',
    ];
    var forwardCloneProperties = replyCloneProperties.concat(['attachments', 'body']);
    var Message = (function (_super) {
        __extends(Message, _super);
        function Message(kwArgs) {
            _super.call(this, kwArgs);
            this.__loaded = true;
            this.set('scenario', 'listView');
        }
        Message.getForwardMessage = function (message) {
            return this._getDistributedMessage(message, 'forward');
        };
        Message.getReplyMessage = function (message, replyType) {
            if (replyType === void 0) { replyType = 0 /* Reply */; }
            return this._getDistributedMessage(message, 'reply', replyType);
        };
        Message.parseEmail = function (recipient) {
            var email = recipient.trim();
            var bracketedEmail = /^(?:[^\<\>]+)?\<([^\>]+)\>$/;
            var bracketedName = /^(?:\<[^\<]+\>)?(.*)/;
            return email.replace(bracketedEmail, '$1').replace(bracketedName, '$1').trim();
        };
        Message._getDistributedMessage = function (message, scenario, replyType) {
            var blank;
            var cloneProperties;
            if (message) {
                blank = new Message({ app: message.get('app') });
                blank.set('scenario', scenario);
                cloneProperties = (scenario === 'forward') ? forwardCloneProperties : replyCloneProperties;
                cloneProperties.forEach(function (property) {
                    blank.set(property, message.get(property));
                });
                this._setRecipients(message, blank, scenario, replyType);
            }
            return blank;
        };
        Message._setRecipients = function (message, blank, scenario, replyType) {
            var user = message.get('app').get('user');
            var userEmail = user.get('data').get('email');
            blank.set('from', userEmail);
            if (scenario === 'reply') {
                blank.set('to', message.getReplyRecipients(replyType));
            }
        };
        Message.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._avatar = '';
            this._bcc = [];
            this._body = '';
            this._cc = [];
            this._commentCount = 0;
            this._connectionType = '';
            this._date = null;
            this._folderId = 0;
            this._folderName = '';
            this._format = 0 /* Plain */;
            this._forwarded = false;
            this._from = '';
            this._hasAttachment = false;
            this._isBlacklisted = false;
            this._isJunk = false;
            this._isRead = false;
            this._isStarred = false;
            this._labels = [];
            this._messageType = '';
            this._priority = 3 /* Normal */;
            this._privacyStatus = '';
            this._readReceipt = false;
            this._replied = false;
            this._replyTo = '';
            this._subject = '';
            this._to = [];
        };
        Message.prototype._folderIdGetter = function () {
            return this._folderId;
        };
        Message.prototype._folderIdSetter = function (folderId) {
            if (this.get('folderId') === folderId) {
                return;
            }
            var id = this.get('id');
            var store = this.get('store');
            var previousId = this.get('folderId');
            this._folderId = folderId;
            if (!this.__loaded) {
                return;
            }
            if (id) {
                store.moveToFolder({
                    messageIds: [id],
                    targetFolder: folderId
                });
                Folder.updateUnreadCount(this, previousId);
            }
        };
        Message.prototype._isBlacklistedGetter = function () {
            return this._isBlacklisted;
        };
        Message.prototype._isBlacklistedSetter = function (isBlacklisted) {
            var id = this.get('id');
            var store = this.get('store');
            var method = isBlacklisted ? 'blacklistSender' : 'whitelistSender';
            if (this._setProperty('isBlacklisted', isBlacklisted) && id) {
                store[method]({ messageIds: [id] });
            }
        };
        Message.prototype._isJunkGetter = function () {
            return this._isJunk;
        };
        Message.prototype._isJunkSetter = function (isJunk) {
            this._setStatus('isJunk', isJunk, 2 /* Junk */, 3 /* NotJunk */);
        };
        Message.prototype._isReadGetter = function () {
            return this._isRead;
        };
        Message.prototype._isReadSetter = function (isRead) {
            var previousState = this.get('isRead');
            this._setStatus('isRead', isRead, 0 /* Read */, 1 /* Unread */);
            if (previousState !== isRead) {
                Folder.updateUnreadCount(this);
            }
        };
        Message.prototype._isStarredGetter = function () {
            return this._isStarred;
        };
        Message.prototype._isStarredSetter = function (isStarred) {
            this._setStatus('isStarred', isStarred, 4 /* Starred */, 5 /* Unstarred */);
        };
        Message.prototype._participantsGetter = function () {
            return [this.get('from')].concat(this.get('to'));
        };
        Message.prototype.getReplyRecipients = function (replyType) {
            if (replyType === void 0) { replyType = 0 /* Reply */; }
            var user = this._app.get('user');
            var userEmail = user.get('data').get('email');
            var recipients = [this.get('from')];
            return replyType === 0 /* Reply */ ? recipients : recipients.concat(this.get('to'), this.get('cc')).filter(function (recipient) {
                return Message.parseEmail(recipient) !== userEmail;
            });
        };
        Message.prototype._setStatus = function (propertyName, value, trueValue, falseValue) {
            var id = this.get('id');
            var store = this.get('store');
            if (this._setProperty(propertyName, value) && id) {
                store.markAs({
                    messageIds: [id],
                    status: value ? trueValue : falseValue
                });
            }
        };
        Message.prototype._setProperty = function (propertyName, value) {
            if (this.get(propertyName) === value) {
                return;
            }
            this['_' + propertyName] = value;
            return this.__loaded;
        };
        return Message;
    })(PersistentModel);
    var Message;
    (function (Message) {
        (function (Priority) {
            Priority[Priority["Unspecified"] = 0] = "Unspecified";
            Priority[Priority["Highest"] = 1] = "Highest";
            Priority[Priority["High"] = 2] = "High";
            Priority[Priority["Normal"] = 3] = "Normal";
            Priority[Priority["Low"] = 4] = "Low";
            Priority[Priority["Lowest"] = 5] = "Lowest";
        })(Message.Priority || (Message.Priority = {}));
        var Priority = Message.Priority;
        (function (Status) {
            Status[Status["Read"] = 0] = "Read";
            Status[Status["Unread"] = 1] = "Unread";
            Status[Status["Junk"] = 2] = "Junk";
            Status[Status["NotJunk"] = 3] = "NotJunk";
            Status[Status["Starred"] = 4] = "Starred";
            Status[Status["Unstarred"] = 5] = "Unstarred";
        })(Message.Status || (Message.Status = {}));
        var Status = Message.Status;
        (function (Format) {
            Format[Format["Plain"] = 0] = "Plain";
            Format[Format["Html"] = 1] = "Html";
        })(Message.Format || (Message.Format = {}));
        var Format = Message.Format;
        (function (ReplyType) {
            ReplyType[ReplyType["Reply"] = 0] = "Reply";
            ReplyType[ReplyType["ReplyAll"] = 1] = "ReplyAll";
        })(Message.ReplyType || (Message.ReplyType = {}));
        var ReplyType = Message.ReplyType;
    })(Message || (Message = {}));
    Message.prototype._scenarios = {
        listView: listViewScenario,
        new: newScenario,
        forward: forwardScenario,
        reply: replyScenario
    };
    Message.setDefaultApp('app/main');
    return Message;
});
//# sourceMappingURL=Message.js.map