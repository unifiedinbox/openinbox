define(["require", "exports", './app', 'app/ui/AlertList', 'app/models/Alert'], function (require, exports, app, AlertList, AlertModel) {
    app.run().then(function () {
        app.get('ui').set('view', new AlertList({
            maximumLength: 3,
            app: app,
            collection: AlertModel.store
        }));
    });
    return app;
});
//# sourceMappingURL=AlertList.js.map