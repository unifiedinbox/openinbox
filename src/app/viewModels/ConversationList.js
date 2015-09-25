var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../models/Contact', '../endpoints', 'mayhem/data/Proxy', '../util'], function (require, exports, Contact, endpoints, Proxy, util) {
    var ConversationProxy = (function (_super) {
        __extends(ConversationProxy, _super);
        function ConversationProxy(kwArgs) {
            _super.call(this, kwArgs);
            this._setDateWatcher();
        }
        ConversationProxy.prototype._smartDateGetter = function () {
            var i18nMessages = this.get('app').get('i18n').get('messages');
            var date = this.get('date');
            return util.formatSmartTime(date, i18nMessages);
        };
        ConversationProxy.prototype._bccGetter = function () {
            return this.get('target').get('bcc').join(', ');
        };
        ConversationProxy.prototype._ccGetter = function () {
            return this.get('target').get('cc').join(', ');
        };
        ConversationProxy.prototype._toGetter = function () {
            return this.get('target').get('to').join(', ');
        };
        ConversationProxy.prototype._hasCcGetter = function () {
            return this.get('cc').length > 0;
        };
        ConversationProxy.prototype._hasBccGetter = function () {
            return this.get('bcc').length > 0;
        };
        ConversationProxy.prototype._contactImageGetter = function () {
            return Contact.store.filter({
                displayName: this.get('fromName')
            }).fetch().then(function (contacts) {
                var first = contacts[0];
                return (first instanceof Contact) ? first.get('image') : '';
            });
        };
        ConversationProxy.prototype._viewSourceLinkGetter = function () {
            return endpoints.viewMessageSource + '?messageId=' + this.get('messageId');
        };
        ConversationProxy.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            if (this._smartDateTimeoutHandle) {
                clearTimeout(this._smartDateTimeoutHandle);
                this._smartDateTimeoutHandle = undefined;
            }
        };
        ConversationProxy.prototype._setDateWatcher = function () {
            var self = this;
            function updateSmartDate() {
                self._setSmartDate();
                self._smartDateTimeoutHandle = setTimeout(updateSmartDate, 60000);
            }
            this._smartDateTimeoutHandle = setTimeout(updateSmartDate, 60000);
        };
        ConversationProxy.prototype._setSmartDate = function () {
            var oldDate = this._smartDate;
            this._smartDate = this.get('smartDate');
            this._notify('smartDate', this._smartDate, oldDate);
        };
        return ConversationProxy;
    })(Proxy);
    return ConversationProxy;
});
//# sourceMappingURL=ConversationList.js.map