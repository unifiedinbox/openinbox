define(["require", "exports", '../app', 'app/ui/connections/ConnectionList', 'app/models/Connection', 'app/models/stores/Connection', '../../mocks/all'], function (require, exports, app, ConnectionList, Connection, ConnectionStore, mocks) {
    ConnectionStore;
    mocks;
    app.run().then(function () {
        return app.get('user').login({ username: 'test', password: 'test' });
    }).then(function () {
        Connection.setDefaultApp(app);
        Connection.store.app = app;
        var connectionList = new ConnectionList({
            app: app,
            collection: Connection.store
        });
        app.get('ui').set('view', connectionList);
        connectionList.on('connectionSelected', function (event) {
            console.log('Connection selected:', event.target.get('model'));
        });
    });
    return app;
});
//# sourceMappingURL=ConnectionList.js.map