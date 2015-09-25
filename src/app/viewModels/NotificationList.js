var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/Proxy', 'mayhem/util', '../util'], function (require, exports, Proxy, mayhemUtil, util) {
    var NotificationViewModel = (function (_super) {
        __extends(NotificationViewModel, _super);
        function NotificationViewModel() {
            _super.apply(this, arguments);
        }
        NotificationViewModel.prototype._commentGetter = function () {
            return this.get('item');
        };
        NotificationViewModel.prototype._markAsTextDependencies = function () {
            return ['isRead'];
        };
        NotificationViewModel.prototype._markAsTextGetter = function () {
            var messages = this.get('app').get('i18n').get('messages');
            var text = messages.toggleReadStatus({ ISREAD: this.get('isRead') });
            return mayhemUtil.escapeXml(text);
        };
        NotificationViewModel.prototype._smartDateGetter = function () {
            var messages = this.get('app').get('i18n').get('messages');
            var date = this.get('item').get('date');
            return util.formatSmartTime(date, messages);
        };
        NotificationViewModel.prototype._stateClassDependencies = function () {
            return ['isRead'];
        };
        NotificationViewModel.prototype._stateClassGetter = function () {
            return this.get('isRead') ? 'is-read' : 'is-unread';
        };
        NotificationViewModel.prototype._subjectGetter = function () {
            var messages = this.get('app').get('i18n').get('messages');
            return messages.commentMention({ NAME: this.get('item').get('contact').get('displayName') });
        };
        return NotificationViewModel;
    })(Proxy);
    var NotificationViewModel;
    (function (NotificationViewModel) {
        ;
        ;
    })(NotificationViewModel || (NotificationViewModel = {}));
    return NotificationViewModel;
});
//# sourceMappingURL=NotificationList.js.map