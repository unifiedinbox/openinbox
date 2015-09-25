define(["require", "exports", '../ui/app', 'app/viewModels/Loading', "mayhem/templating/html!app/views/Loading.html"], function (require, exports, app, LoadingViewModel) {
    var Loading = require('mayhem/templating/html!app/views/Loading.html');
    app.run().then(function () {
        var loading = new Loading({
            app: app,
            model: new LoadingViewModel({
                message: 'The future depends on what we do in the present.',
                author: 'Mahatma Gandhi'
            })
        });
        app.get('ui').set('view', loading);
    });
    return app;
});
//# sourceMappingURL=Loading.js.map