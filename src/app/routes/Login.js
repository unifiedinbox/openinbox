var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../viewModels/Login', 'mayhem/Observable', "mayhem/templating/html!app/views/Login.html"], function (require, exports, LoginViewModel, Observable) {
    var Login = require('mayhem/templating/html!app/views/Login.html');
    var Route = (function (_super) {
        __extends(Route, _super);
        function Route() {
            _super.apply(this, arguments);
        }
        Route.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._view && this._view.destroy();
            this._viewModel && this._viewModel.destroy();
        };
        Route.prototype.enter = function (kwArgs) {
            return this.update(kwArgs);
        };
        Route.prototype.update = function (kwArgs) {
            if (!kwArgs.action) {
                return this.get('app').get('router').go('login', { action: 'login' });
            }
            var key = '_' + (kwArgs.action || 'login') + 'ActionHandler';
            if (this[key]) {
                return this[key](kwArgs);
            }
            return null;
        };
        Route.prototype._loginActionHandler = function (kwArgs) {
            var app = this.get('app');
            if (app.get('user').get('isAuthenticated')) {
                return app.get('router').go('loading');
            }
            var login = this._view;
            if (!login) {
                this._viewModel = new LoginViewModel({ app: app });
                login = this._view = new Login({
                    app: app,
                    model: this._viewModel
                });
            }
            this._viewModel.reset();
            app.get('ui').set('view', login);
            return null;
        };
        Route.prototype._logoutActionHandler = function (kwArgs) {
            var app = this.get('app');
            return app.get('user').logout().then(function () {
                app.get('router').go('login', { action: 'login' });
            });
        };
        Route.prototype._registerActionHandler = function (kwArgs) {
            var app = this.get('app');
            app.get('user').register();
            return null;
        };
        Route.prototype._resetpasswordActionHandler = function (kwArgs) {
            var app = this.get('app');
            app.get('user').resetPassword();
            return null;
        };
        return Route;
    })(Observable);
    return Route;
});
//# sourceMappingURL=Login.js.map