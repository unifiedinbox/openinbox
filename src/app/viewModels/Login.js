var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'dojo/_base/lang', 'mayhem/Observable'], function (require, exports, lang, Observable) {
    var LoginViewModel = (function (_super) {
        __extends(LoginViewModel, _super);
        function LoginViewModel() {
            _super.apply(this, arguments);
        }
        LoginViewModel.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._errorMessage = '';
            this._stayLoggedIn = false;
        };
        LoginViewModel.prototype.submit = function (event) {
            return (event.code === 'Enter') ? this.login() : null;
        };
        LoginViewModel.prototype.login = function () {
            var app = this.get('app');
            var user = app.get('user');
            return user.login({
                username: this._username,
                password: this._password
            }).then(this._loginSuccess.bind(this), this._loginFailure.bind(this));
        };
        LoginViewModel.prototype._loginFailure = function (error) {
            var app = this.get('app');
            var messages = app.get('i18n').get('messages');
            var status = lang.getObject('response.0.errors.message.details.status', false, error.response.data);
            this.set('errorMessage', status === 401 ? messages.loginFail() : messages.loginError());
            this.set('errorClass', 'error');
        };
        LoginViewModel.prototype._loginSuccess = function (successResponse) {
            var router = this.get('app').get('router');
            router && router.go('loading');
        };
        LoginViewModel.prototype.toggleStayLoggedIn = function () {
            this.set('stayLoggedIn', !this._stayLoggedIn);
        };
        LoginViewModel.prototype.reset = function () {
            this.set('errorClass', '');
            this.set('errorMessage', '');
            this.set('stayLoggedIn', false);
            this.set('username', '');
            this.set('password', '');
        };
        return LoginViewModel;
    })(Observable);
    var LoginViewModel;
    (function (LoginViewModel) {
        ;
        ;
    })(LoginViewModel || (LoginViewModel = {}));
    return LoginViewModel;
});
//# sourceMappingURL=Login.js.map