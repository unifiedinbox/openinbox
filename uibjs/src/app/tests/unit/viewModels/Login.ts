import aspect = require('dojo/aspect');
import assert = require('intern/chai!assert');
import endpoints = require('app/endpoints');
import registerSuite = require('intern!object');
import RequestError = require('dojo/errors/RequestError');
import ViewModel = require('app/viewModels/Login');
import WebApplication = require('mayhem/WebApplication');

var app:WebApplication;
var viewModel:ViewModel;

function createApp(kwArgs?:HashMap<any>) {
    app = new WebApplication({
        name: 'Test',
        components: {
            i18n: { preload: [ 'app/nls/main' ] },
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

    before() {
        return createApp();
    },

    beforeEach() {
        viewModel = new ViewModel({ app: app });
    },

    afterEach() {
        viewModel.destroy();
    },

    after() {
        app.destroy();
    },

    'login success'():IPromise<void> {
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
        return viewModel.login()
            .then(function () {
                assert.strictEqual(successCalled, true);
                assert.strictEqual(failCalled, false);
                assert.strictEqual(viewModel.get('errorMessage'), '');
                assert.strictEqual(viewModel.get('errorClass'), undefined);
            });
    },

    'login 401 failure'():IPromise<void> {
        var successCalled = false;
        var failCalled = false;

        aspect.after(viewModel, '_loginSuccess', function () {
            successCalled = true;
        });

        aspect.after(viewModel, '_loginFailure', function () {
            failCalled = true;
        });

        viewModel.set('username', 'Bob Smith');
        return viewModel.login()
            .then(function () {
                var messages = (<any> app.get('i18n')).get('messages');
                assert.strictEqual(successCalled, false);
                assert.strictEqual(failCalled, true);
                assert.strictEqual(viewModel.get('errorMessage'), messages.loginFail());
                assert.strictEqual(viewModel.get('errorClass'), 'error');
            });
    },

    'login 500 failure'():IPromise<void> {
        var successCalled = false;
        var failCalled = false;

        aspect.after(viewModel, '_loginSuccess', function () {
            successCalled = true;
        });

        aspect.after(viewModel, '_loginFailure', function () {
            failCalled = true;
        });

        return viewModel.login()
            .then(function () {
                var messages = (<any> app.get('i18n')).get('messages');
                assert.strictEqual(successCalled, false);
                assert.strictEqual(failCalled, true);
                assert.strictEqual(viewModel.get('errorMessage'), messages.loginError())
                assert.strictEqual(viewModel.get('errorClass'), 'error');
            });
    }
});
