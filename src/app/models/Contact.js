var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/PersistentModel'], function (require, exports, PersistentModel) {
    var Contact = (function (_super) {
        __extends(Contact, _super);
        function Contact() {
            _super.apply(this, arguments);
        }
        Contact.prototype._connectionTypesDependencies = function () {
            return ['accounts'];
        };
        Contact.prototype._connectionTypesGetter = function () {
            var types = {};
            this.get('accounts').forEach(function (account) {
                types[account.eType] = true;
            });
            return Object.keys(types);
        };
        Contact.prototype._firstNameDependencies = function () {
            return ['displayName'];
        };
        Contact.prototype._firstNameGetter = function () {
            return this.get('displayName').split(/\s/)[0];
        };
        Contact.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._displayName = '';
            this._image = '';
            this._accounts = [];
            this._id = Date.now() * Math.random();
        };
        return Contact;
    })(PersistentModel);
    Contact.setDefaultApp('app/main');
    return Contact;
});
//# sourceMappingURL=Contact.js.map