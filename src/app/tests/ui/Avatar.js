define(["require", "exports", './app', 'app/ui/Avatar'], function (require, exports, app, Avatar) {
    app.run().then(function () {
        app.get('ui').set('view', new Avatar({
            app: app,
            image: 'KF'
        }));
    });
    return app;
});
//# sourceMappingURL=Avatar.js.map