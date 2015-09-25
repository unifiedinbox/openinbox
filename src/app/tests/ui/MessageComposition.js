define(["require", "exports", './app', 'mayhem/ui/Container', 'app/models/Attachment', 'app/models/Connection', 'app/models/Contact', 'app/models/stores/Contact', 'app/models/Folder', 'app/models/stores/Folder', 'app/models/Message', 'app/viewModels/MessageComposition', 'app/models/stores/Message', 'app/ui/MessageComposition', 'app/models/stores/TrackableMemory', '../mocks/all'], function (require, exports, app, Container, Attachment, Connection, Contact, ContactStore, Folder, FolderStore, Message, MessageProxy, MessageStore, MessageComposition, TrackableMemory, mocks) {
    ContactStore;
    FolderStore;
    MessageStore;
    mocks;
    Contact.setDefaultStore(new TrackableMemory({ data: [
        new Contact({
            id: 1,
            app: app,
            displayName: 'Bob Smith',
            image: 'BS',
            accounts: [{ eType: 'E', address: 'bob@smith.com' }, { eType: 'M', address: 'bob@smith.com' }]
        }),
        new Contact({
            id: 2,
            app: app,
            displayName: 'Todd Jones',
            image: 'TJ',
            accounts: [{ eType: 'E', address: 'todd@jones.com' }, { eType: 'M', address: 'todd@jones.com' }]
        }),
        new Contact({
            id: 3,
            app: app,
            displayName: 'Fred Williams',
            image: 'FW',
            accounts: [{ eType: 'E', address: 'fred@williams.com' }]
        })
    ] }));
    Connection.setDefaultApp(app);
    Connection.setDefaultStore(new TrackableMemory({ data: [
        new Connection({
            id: 1,
            app: app,
            account: 'john@doe.com',
            type: 'E'
        }),
        new Connection({
            id: 2,
            app: app,
            account: 'john@doe.name',
            type: 'M'
        })
    ] }));
    app.run().then(function () {
        var user = app.get('user');
        user.login({
            username: 'test',
            password: 'pass'
        }).then(function () {
            Message.setDefaultApp(app);
            Message.store.app = app;
            var attachmentStore = new TrackableMemory({ app: app });
            Attachment.setDefaultApp(app);
            Attachment.setDefaultStore(attachmentStore);
            Contact.setDefaultApp(app);
            Contact.store.app = app;
            Folder.setDefaultApp(app);
            Folder.store.app = app;
            Message.store.app = app;
            user.set('folders', Folder.store);
            var container = new Container({ app: app });
            var model = new MessageProxy({ target: new Message({ app: app }) });
            var composition = new MessageComposition({
                app: app,
                model: model
            });
            container.add(composition);
            app.get('ui').set('view', container);
        });
    });
    return app;
});
//# sourceMappingURL=MessageComposition.js.map