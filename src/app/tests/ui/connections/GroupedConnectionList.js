define(["require", "exports", '../app', 'app/ui/connections/GroupedConnectionList', 'app/models/Connection', 'app/models/stores/Connection', '../../mocks/all'], function (require, exports, app, GroupedConnectionList, Connection, ConnectionStore, mocks) {
    ConnectionStore;
    mocks;
    app.run().then(function () {
        return app.get('user').login({ username: 'test', password: 'test' });
    }).then(function () {
        Connection.setDefaultApp(app);
        Connection.store.app = app;
        var connectionList = new GroupedConnectionList({
            app: app,
            collection: Connection.store
        });
        app.get('ui').set('view', connectionList);
        app.get('binder').createBinding(connectionList.get('value'), '*').observe(function (change) {
            var type = change.added ? 'added' : 'removed';
            var connection = change[type][0];
            console.log('selection ' + type + ':', connection.get('displayName'), connection.get('type'));
        });
    });
    return app;
});
//# sourceMappingURL=GroupedConnectionList.js.map