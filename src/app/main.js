define(["require", "exports", './tests/mocks/all', 'mayhem/WebApplication'], function (require, exports, mocks, WebApplication) {
    mocks;
    var app = new WebApplication({
        name: 'Unified Inbox',
        apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT',
        components: {
            i18n: { preload: ['app/nls/main'] },
            router: {
                defaultRoute: { routeId: 'login', kwArgs: { action: 'login' } },
                rules: [
                    {
                        routeId: 'inbox',
                        path: 'inbox/<folderId:\\d+>'
                    },
                    {
                        routeId: 'loading',
                        path: 'loading'
                    },
                    {
                        routeId: 'login',
                        path: 'login/<action:login|logout|register|resetpassword>'
                    }
                ],
                routes: {
                    'inbox': 'app/routes/Inbox',
                    'loading': 'app/routes/Loading',
                    'login': 'app/routes/Login',
                }
            },
            ui: { view: null },
            user: {
                constructor: 'app/auth/User'
            }
        }
    });
    app.run().otherwise(function (error) {
        console.log('app error', error);
    });
    return app;
});
//# sourceMappingURL=main.js.map