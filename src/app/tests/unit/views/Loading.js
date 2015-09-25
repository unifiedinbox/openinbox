define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'app/viewModels/Loading', 'mayhem/WebApplication', "mayhem/templating/html!app/views/Loading.html"], function (require, exports, assert, registerSuite, has, LoadingViewModel, WebApplication) {
    var Loading = require('mayhem/templating/html!app/views/Loading.html');
    var app;
    var loading;
    function createApp(kwArgs) {
        app = new WebApplication({
            name: 'Test',
            components: {
                router: null,
                ui: { view: null }
            }
        });
        return app.run().then(function () {
            loading = new Loading({
                app: app,
                model: new LoadingViewModel(kwArgs)
            });
            app.get('ui').set('view', loading);
        });
    }
    function testTextContent(selector, expectedValue) {
        var node = loading.get('firstNode').nextSibling.querySelector(selector);
        assert.strictEqual(expectedValue, node.textContent.trim());
    }
    registerSuite({
        name: 'app/ui/Loading',
        'get/set tests': {
            beforeEach: function () {
                return createApp();
            },
            afterEach: function () {
                app.destroy();
            },
            authorBlank: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                testTextContent('.Loading-author', '');
            },
            messageBlank: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                testTextContent('.Loading-message', '');
            }
        },
        'initialization tests': {
            afterEach: function () {
                app.destroy();
            },
            'author set': function () {
                return createApp({
                    author: 'bob smith'
                }).then(function () {
                    testTextContent('.Loading-author', 'bob smith');
                });
            },
            'message set': function () {
                return createApp({
                    message: 'here is a message'
                }).then(function () {
                    testTextContent('.Loading-message', 'here is a message');
                });
            }
        }
    });
});
//# sourceMappingURL=Loading.js.map