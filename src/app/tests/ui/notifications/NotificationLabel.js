define(["require", "exports", '../app', 'app/models/Notification', 'app/ui/notifications/NotificationLabel', 'dojo/on'], function (require, exports, app, Notification, NotificationLabel, on) {
    Notification.setDefaultApp(app);
    app.run().then(function () {
        var label;
        var index = 0;
        while (index < 10) {
            Notification.store.put(new Notification({
                id: index
            }));
            index += 1;
        }
        label = new NotificationLabel({
            app: app,
            collection: Notification.store
        });
        app.get('ui').set('view', label);
        on(document.getElementById('incrementCount'), 'click', function () {
            label.set('notificationCount', label.get('notificationCount') + 1);
        });
        on(document.getElementById('decrementCount'), 'click', function () {
            var count = Math.max(0, label.get('notificationCount') - 1);
            label.set('notificationCount', count);
        });
    });
    return app;
});
//# sourceMappingURL=NotificationLabel.js.map