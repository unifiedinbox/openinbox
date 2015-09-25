define(["require", "exports", '../app', 'app/models/Connection', 'app/models/stores/Connection', 'app/models/Message', 'app/ui/messages/MessageFilters', 'app/models/stores/Message', 'dojo/on', 'app/viewModels/MessageFilters', '../../mocks/all', "dojo/dom-form", "mayhem/templating/html!app/ui/messages/MessageFilters.html"], function (require, exports, app, Connection, ConnectionStore, Message, MessageFilters, MessageStore, on, ViewModel, mocks) {
    ConnectionStore;
    mocks;
    var domForm = require('dojo/dom-form');
    Connection.setDefaultApp(app);
    Connection.store.app = app;
    Message.setDefaultApp(app);
    Message.setDefaultStore(new MessageStore({ app: app }));
    app.run().then(function () {
        on(document.querySelector('.LoginForm'), 'submit', function (event) {
            event.preventDefault();
            var value = domForm.toObject(this);
            var user = app.get('user');
            user.login({
                username: value.username,
                password: value.password
            }).then(function () {
                var model = new ViewModel({
                    app: app,
                    messages: Message.store,
                    connections: Connection.store
                });
                var messageFilters = new MessageFilters({
                    app: app,
                    model: model
                });
                app.get('ui').set('view', messageFilters);
                app.get('binder').createBinding(model, 'selectedFilter').observe(function (change) {
                    console.log('Selected filter set to ' + change.value);
                });
                app.get('binder').createBinding(model, 'selectedSort').observe(function (change) {
                    console.log('Selected sort set to ' + change.value);
                });
                app.get('binder').createBinding(model, 'selectedConnections').observe(function (change) {
                    if (change.value) {
                        var names = change.value.map(function (connection) {
                            return connection.get('type') + ': ' + connection.get('displayName');
                        });
                        console.log('Connection filters set to: ' + names.join('; '));
                    }
                });
            });
        });
    });
    return app;
});
//# sourceMappingURL=MessageFilters.js.map