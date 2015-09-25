var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../viewModels/Loading', 'mayhem/Observable', "mayhem/templating/html!app/views/Loading.html"], function (require, exports, LoadingViewModel, Observable) {
    var Loading = require('mayhem/templating/html!../views/Loading.html');
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
        Route.prototype.enter = function () {
            return this.update();
        };
        Route.prototype.update = function () {
            var app = this.get('app');
            var user = app.get('user');
            var loading = this._view;
            if (!user.get('isAuthenticated')) {
                return app.get('router').go('login', { action: 'login' });
            }
            if (!loading) {
                var quote = user.get('session').get('quote');
                var viewModel = this._viewModel = new LoadingViewModel({
                    author: quote.author,
                    message: quote.quotes
                });
                loading = this._view = new Loading({
                    app: app,
                    model: viewModel
                });
            }
            app.get('ui').set('view', loading);
            user.preloadData().then(function () {
                app.get('router').go('inbox', { folderId: 5 });
            });
        };
        return Route;
    })(Observable);
    return Route;
});
//# sourceMappingURL=Loading.js.map