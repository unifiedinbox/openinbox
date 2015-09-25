var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/auth/User', 'mayhem/Promise', '../endpoints', 'dojo/_base/lang', 'dojo/request', 'dojo/errors/RequestError', './Session', '../models/User', '../models/Connection', '../models/stores/Connection', '../models/Contact', '../models/stores/Contact', '../models/Folder', '../models/stores/Folder'], function (require, exports, BaseUser, Promise, endpoints, lang, request, RequestError, Session, UserModel, Connection, ConnectionStore, Contact, ContactStore, Folder, FolderStore) {
    ConnectionStore;
    ContactStore;
    FolderStore;
    var User = (function (_super) {
        __extends(User, _super);
        function User() {
            _super.apply(this, arguments);
        }
        User.prototype.login = function (kwArgs) {
            var _this = this;
            return _super.prototype.login.call(this, kwArgs).then(function (response) {
                var data = response.response[0].data;
                if (!data) {
                    throw new RequestError('User not logged in', response);
                }
                _this.set('id', data.account_id);
                _this.set('sessionId', data.session);
                _this.set('uibApplication', data.app);
                _this.set('data', new UserModel({
                    email: data.account_email,
                    fullName: data.user_full_name,
                    id: data.account_id,
                    image: data.account_avatar || data.default_avatar,
                    username: data.user_name
                }));
                var session = _this._session = new Session({
                    userId: _this.get('id')
                });
                session.set('quote', data.quotes);
                return response;
            });
        };
        User.prototype.authenticate = function (kwArgs) {
            return request.post(endpoints.login, {
                handleAs: 'json',
                headers: {
                    apikey: this.get('app').get('apikey')
                },
                data: lang.mixin({ service: 'uib' }, kwArgs)
            });
        };
        User.prototype.logout = function () {
            Contact.store.evictAll();
            _super.prototype.logout.call(this);
            this.set('sessionId', '');
            this.set('uibApplication', '');
            return request.post(endpoints.logout, {
                headers: {
                    apikey: this.get('app').get('apikey')
                }
            });
        };
        User.prototype.preloadData = function () {
            var promises = [];
            var user = this;
            promises.push(Folder.store.fetch().then(function () {
                user.set('folders', Folder.store);
            }));
            promises.push(Contact.store.fetch().then(function () {
                user.set('contacts', Contact.store);
            }));
            promises.push(Connection.store.fetch().then(function () {
                user.set('connections', Connection.store);
            }));
            return Promise.all(promises);
        };
        User.prototype.register = function () {
            window.location.href = endpoints.register;
            return null;
        };
        User.prototype.resetPassword = function () {
            window.location.href = endpoints.forgotPassword;
            return null;
        };
        return User;
    })(BaseUser);
    var User;
    (function (User) {
        ;
        ;
    })(User || (User = {}));
    return User;
});
//# sourceMappingURL=User.js.map