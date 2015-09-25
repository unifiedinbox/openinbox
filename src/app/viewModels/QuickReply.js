var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../models/Contact', '../models/Message', './NewMessage', 'mayhem/Promise', '../models/stores/TrackableMemory'], function (require, exports, Contact, Message, NewMessageProxy, Promise, TrackableMemory) {
    var QuickReply = (function (_super) {
        __extends(QuickReply, _super);
        function QuickReply(kwArgs) {
            var _this = this;
            _super.call(this, kwArgs);
            this._getContactMap().then(function (map) {
                _this.set({
                    recipients: new TrackableMemory({
                        app: _this.get('app'),
                        data: map.replyAll
                    }),
                    initialRecipients: (_this._replyType === 1 /* ReplyAll */) ? map.replyAll : map.reply
                });
            });
        }
        QuickReply.prototype._lowerCaseToGetter = function () {
            return this.get('app').get('i18n').get('messages').to().toLowerCase();
        };
        QuickReply.prototype._replyIconDependencies = function () {
            return ['replyType'];
        };
        QuickReply.prototype._replyIconGetter = function () {
            return this._replyType === 1 /* ReplyAll */ ? 'icon-app-reply-all' : 'icon-app-reply';
        };
        QuickReply.prototype._replyTypeGetter = function () {
            return this._replyType;
        };
        QuickReply.prototype._replyTypeSetter = function (value) {
            var _this = this;
            this._replyType = value;
            if (this._source) {
                this._getContactMap().then(function (map) {
                    var replyAll = (_this._replyType === 1 /* ReplyAll */);
                    _this.set('initialRecipients', replyAll ? map.replyAll : map.reply);
                });
            }
        };
        QuickReply.prototype._selectedRecipientsGetter = function () {
            return this._selectedRecipients;
        };
        QuickReply.prototype._selectedRecipientsSetter = function (value) {
            var _this = this;
            if (!value || !value.length) {
                if (this._selectedRecipients) {
                    this.set('initialRecipients', this._selectedRecipients);
                }
                else {
                    this._getContactMap().then(function (map) {
                        var replyAll = _this._replyType === 1 /* ReplyAll */;
                        var recipients = replyAll ? map.replyAll : map.reply;
                        _this._setRecipients(recipients);
                    });
                }
            }
            else {
                this._setRecipients(value);
            }
        };
        QuickReply.prototype._toDisplayDependencies = function () {
            return ['to'];
        };
        QuickReply.prototype._toDisplayGetter = function () {
            if (!this._selectedRecipients) {
                return '';
            }
            return this._selectedRecipients.map(function (contact) {
                return contact.get('displayName');
            }).join(', ');
        };
        QuickReply.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._replyIcon = 'icon-app-reply';
            this._initialRecipients = null;
            this.set({
                compositionAction: 'reply',
                recipients: null,
                replyType: 0 /* Reply */,
                source: null
            });
        };
        QuickReply.prototype._getContactMap = function () {
            var _this = this;
            if (this._contactMapPromise) {
                return this._contactMapPromise;
            }
            var recipients = this._getRecipientMap();
            return Contact.store.forEach(function (contact) {
                var accounts = contact.get('accounts');
                var email;
                if (accounts) {
                    for (var i = accounts.length; i--;) {
                        email = accounts[i].address;
                        if (recipients[email]) {
                            recipients[email].contact = contact;
                        }
                    }
                }
            }).then(function () {
                var contactMap = { reply: [], replyAll: [], toNameMap: {} };
                return Promise.all(Object.keys(recipients).map(function (email) {
                    var recipient = recipients[email];
                    return _this._getContact(recipient).then(function (contact) {
                        if (recipient.field === 'from') {
                            contactMap.reply.push(contact);
                        }
                        contactMap.replyAll.push(contact);
                        contactMap.toNameMap[contact.get('displayName')] = recipient.displayName;
                    });
                })).then(function () {
                    _this._contactMapPromise = Promise.resolve(contactMap);
                    return contactMap;
                });
            });
        };
        QuickReply.prototype._getContact = function (recipient) {
            if (recipient.contact) {
                return Promise.resolve(recipient.contact);
            }
            return Contact.store.filter({
                displayName: recipient.displayName
            }).fetch().then(function (contacts) {
                if (contacts.length) {
                    return Promise.resolve(contacts[0]);
                }
                return Contact.store.put(new Contact({
                    displayName: recipient.displayName
                }));
            });
        };
        QuickReply.prototype._getRecipientMap = function () {
            var _this = this;
            var recipients = {};
            var from = this._source.get('from');
            var fromEmail = Message.parseEmail(from);
            this._setRecipientMapItem(recipients, from, 'from');
            this._source.getReplyRecipients(1 /* ReplyAll */).forEach(function (recipient) {
                var email = Message.parseEmail(recipient);
                if (recipient !== from && (email && email !== fromEmail)) {
                    _this._setRecipientMapItem(recipients, recipient);
                }
            });
            return recipients;
        };
        QuickReply.prototype._setRecipientMapItem = function (map, recipient, field) {
            if (field === void 0) { field = 'to'; }
            var email = Message.parseEmail(recipient);
            var item = {
                displayName: recipient,
                field: field
            };
            if (email) {
                map[email] = item;
            }
            else {
                map[recipient] = item;
            }
        };
        QuickReply.prototype._setRecipients = function (value) {
            var _this = this;
            this._selectedRecipients = value;
            this._getContactMap().then(function (map) {
                _this.set('to', value.map(function (contact) {
                    return map[contact.get('displayName')];
                }));
            });
        };
        return QuickReply;
    })(NewMessageProxy);
    return QuickReply;
});
//# sourceMappingURL=QuickReply.js.map