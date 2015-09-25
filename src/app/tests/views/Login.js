define(["require", "exports", '../ui/app', '../mocks/Login', "mayhem/templating/html!app/views/Login.html"], function (require, exports, app, LoginServiceMock) {
    LoginServiceMock;
    var Login = require('mayhem/templating/html!app/views/Login.html');
    app.run().then(function () {
        var login = new Login({
            app: app
        });
        app.get('ui').set('view', login);
    });
    return app;
});
//# sourceMappingURL=Login.js.map