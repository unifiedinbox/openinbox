var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/PersistentModel'], function (require, exports, PersistentModel) {
    var Conversation = (function (_super) {
        __extends(Conversation, _super);
        function Conversation() {
            _super.apply(this, arguments);
        }
        Conversation.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._bcc = [];
            this._body = '';
            this._cc = [];
            this._date = new Date();
            this._forwarded = false;
            this._fromEmail = '';
            this._fromName = '';
            this._messageId = 0;
            this._replied = false;
            this._subject = '';
            this._to = [];
        };
        return Conversation;
    })(PersistentModel);
    Conversation.setDefaultApp('app/main');
    return Conversation;
});
//# sourceMappingURL=Conversation.js.map