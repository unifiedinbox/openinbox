var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './Attachments', '../models/Contact', 'dojo/_base/lang', '../models/Folder', 'mayhem/Promise', 'mayhem/data/Proxy', '../util'], function (require, exports, AttachmentViewModel, Contact, lang, Folder, Promise, Proxy, util) {
    var messageActionsData = {
        draft: {
            hideArchive: true,
            hideFolders: true,
            hideMarkAs: true,
            hideDistribute: true,
            hideMore: true
        },
        sent: {},
        none: {}
    };
    var MessageProxy = (function (_super) {
        __extends(MessageProxy, _super);
        function MessageProxy(kwArgs) {
            _super.call(this, kwArgs);
            this._setDateWatcher();
        }
        MessageProxy.prototype._attachmentsGetter = function () {
            return this._attachments;
        };
        MessageProxy.prototype._attachmentsSetter = function (value) {
            if (value) {
                this._attachments = AttachmentViewModel.Proxy.forCollection(value);
            }
        };
        MessageProxy.prototype._contactsDependencies = function () {
            return ['from', 'to', 'folderId'];
        };
        MessageProxy.prototype._contactsGetter = function () {
            var _this = this;
            return this.get('rowType').then(function (rowType) {
                if (rowType === 'draft') {
                    return _this._getDraftContacts();
                }
                else if (rowType === 'sent') {
                    return _this._getOutboxContacts();
                }
                else {
                    return _this._getContacts().then(function (contacts) {
                        var to = contacts.slice(1);
                        var first = contacts[0];
                        return {
                            image: (first instanceof Contact) ? first.get('image') : '',
                            text: _this._getContactText(contacts),
                            participantCount: to.length > 1 ? to.length : 0
                        };
                    });
                }
            });
        };
        MessageProxy.prototype._dateLabelGetter = function () {
            var now = new Date();
            var date = this.get('date');
            var i18n = this.get('app').get('i18n');
            return !date ? '' : i18n.formatDate(date, {
                datePattern: (date.getFullYear() !== now.getFullYear()) ? 'yyyy MMM d' : 'MMM d',
                timePattern: 'h:mma'
            });
        };
        MessageProxy.prototype._isScheduledDependencies = function () {
            return ['smartDate'];
        };
        MessageProxy.prototype._isScheduledGetter = function () {
            var date = this.get('date');
            return date && date.getTime() > Date.now();
        };
        MessageProxy.prototype._messageActionsDataGetter = function () {
            return this.get('rowType').then(function (type) {
                return lang.mixin({}, messageActionsData[type]);
            });
        };
        MessageProxy.prototype._privacyIconClassDependencies = function () {
            return ['commentCount', 'privacyStatus'];
        };
        MessageProxy.prototype._privacyIconClassGetter = function () {
            var status = this.get('privacyStatus') || '';
            var classes = ['MessageRow-privacy--' + status.replace('privacy-', '')];
            if (this.get('commentCount')) {
                classes.push('has-comments');
            }
            return classes.join(' ');
        };
        MessageProxy.prototype._rowTypeGetter = function () {
            return (this.get('messageType') === 'c') ? Promise.resolve('draft') : Folder.get(this.get('folderId')).then(function (folder) {
                var name = folder && folder.get('name');
                return (name === 'Outbox' || name === 'Sent') ? 'sent' : 'none';
            });
        };
        MessageProxy.prototype._smartDateGetter = function () {
            var messages = this.get('app').get('i18n').get('messages');
            var date = this.get('date');
            return util.formatSmartTime(date, messages);
        };
        MessageProxy.prototype._stateClassesDependencies = function () {
            return ['isRead', 'isSelected', 'isStarred', 'replied', 'forwarded'];
        };
        MessageProxy.prototype._stateClassesGetter = function () {
            var _this = this;
            var states = ['isSelected', 'isStarred'];
            var pattern = /^is[A-Z]/;
            var classes = [];
            classes.push((this.get('isRead')) ? 'is-read' : 'is-unread');
            if (this.get('replied')) {
                classes.push('is-replied');
            }
            if (this.get('forwarded')) {
                classes.push('is-forwarded');
            }
            states.forEach(function (state) {
                if (_this.get(state)) {
                    classes.push('is-' + (pattern.test(state) ? state.charAt(2).toLowerCase() + state.slice(3) : state));
                }
            });
            return classes.join(' ');
        };
        MessageProxy.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            clearTimeout(this._smartDateTimer);
        };
        MessageProxy.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this.set('compositionAction', null);
        };
        MessageProxy.prototype._getContacts = function (excludeFrom) {
            if (excludeFrom === void 0) { excludeFrom = false; }
            var names = excludeFrom ? [] : [this.get('from')];
            var to = this.get('to') || [];
            var promises = (to.length ? names.concat(to) : names).map(function (name) {
                return Contact.store.filter({ displayName: name }).fetch().then(function (contacts) {
                    return contacts.length ? contacts[0] : name;
                });
            });
            return Promise.all(promises);
        };
        MessageProxy.prototype._getContactDisplayName = function (contact, getFullName) {
            if (getFullName === void 0) { getFullName = false; }
            var primary = getFullName ? 'displayName' : 'firstName';
            var secondary = getFullName ? 'firstName' : 'displayName';
            return (typeof contact === 'string') ? contact : (contact.get(primary) || contact.get(secondary));
        };
        MessageProxy.prototype._getContactText = function (contacts) {
            var first = contacts[0];
            var second = contacts.length === 2 && contacts[1];
            if (!first) {
                return '';
            }
            if (second) {
                return this._getContactDisplayName(first) + ', ' + this._getContactDisplayName(second);
            }
            return this._getContactDisplayName(first, true);
        };
        MessageProxy.prototype._getDraftContacts = function () {
            var app = this.get('app');
            var messages = app.get('i18n').get('messages');
            return Promise.resolve({
                image: app.get('user').get('data').get('image'),
                label: messages.draft()
            });
        };
        MessageProxy.prototype._getOutboxContacts = function () {
            var _this = this;
            return this._getContacts(true).then(function (to) {
                var app = _this.get('app');
                return {
                    image: app.get('user').get('data').get('image'),
                    text: _this._getContactText(to),
                    participantCount: to.length > 2 ? to.length - 2 : 0
                };
            });
        };
        MessageProxy.prototype._setDateWatcher = function () {
            var self = this;
            function updateSmartDate() {
                self._setSmartDate();
                self._smartDateTimer = setTimeout(updateSmartDate, 60000);
            }
            this._smartDateTimer = setTimeout(updateSmartDate, 60000);
        };
        MessageProxy.prototype._setSmartDate = function () {
            var oldDate = this._smartDate;
            this._smartDate = this.get('smartDate');
            this._notify('smartDate', this._smartDate, oldDate);
        };
        return MessageProxy;
    })(Proxy);
    return MessageProxy;
});
//# sourceMappingURL=MessageList.js.map