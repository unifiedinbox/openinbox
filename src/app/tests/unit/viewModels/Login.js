define(["require", "exports", 'dojo/aspect', 'intern/chai!assert', 'intern!object', 'app/viewModels/Login', 'mayhem/WebApplication'], function (require, exports, aspect, assert, registerSuite, ViewModel, WebApplication) {
    var app;
    var viewModel;
    function createApp(kwArgs) {
        app = new WebApplication({
            name: 'Test',
            components: {
                i18n: { preload: ['app/nls/main'] },
                router: null,
                ui: { view: null },
                user: {
                    constructor: 'app/auth/User'
                },
                apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT'
            }
        });
        return app.run();
    }
    registerSuite({
        name: 'app/viewModels/Login',
        before: function () {
            return createApp();
        },
        beforeEach: function () {
            viewModel = new ViewModel({ app: app });
        },
        afterEach: function () {
            viewModel.destroy();
        },
        after: function () {
            app.destroy();
        },
        'login success': function () {
            var successCalled = false;
            var failCalled = false;
            aspect.after(viewModel, '_loginSuccess', function () {
                successCalled = true;
            });
            aspect.after(viewModel, '_loginFailure', function () {
                failCalled = true;
            });
            viewModel.set('username', 'Bob Smith');
            viewModel.set('password', 'letmein');
            return viewModel.login().then(function () {
                assert.strictEqual(successCalled, true);
                assert.strictEqual(failCalled, false);
                assert.strictEqual(viewModel.get('errorMessage'), '');
                assert.strictEqual(viewModel.get('errorClass'), undefined);
            });
        },
        'login 401 failure': function () {
            var successCalled = false;
            var failCalled = false;
            aspect.after(viewModel, '_loginSuccess', function () {
                successCalled = true;
            });
            aspect.after(viewModel, '_loginFailure', function () {
                failCalled = true;
            });
            viewModel.set('username', 'Bob Smith');
            return viewModel.login().then(function () {
                var messages = app.get('i18n').get('messages');
                assert.strictEqual(successCalled, false);
                assert.strictEqual(failCalled, true);
                assert.strictEqual(viewModel.get('errorMessage'), messages.loginFail());
                assert.strictEqual(viewModel.get('errorClass'), 'error');
            });
        },
        'login 500 failure': function () {
            var successCalled = false;
            var failCalled = false;
            aspect.after(viewModel, '_loginSuccess', function () {
                successCalled = true;
            });
            aspect.after(viewModel, '_loginFailure', function () {
                failCalled = true;
            });
            return viewModel.login().then(function () {
                var messages = app.get('i18n').get('messages');
                assert.strictEqual(successCalled, false);
                assert.strictEqual(failCalled, true);
                assert.strictEqual(viewModel.get('errorMessage'), messages.loginError());
                assert.strictEqual(viewModel.get('errorClass'), 'error');
            });
        }
    });
});
//# sourceMappingURL=Login.js.map