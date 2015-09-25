define(["require", "exports", '../app', 'app/models/Attachment', 'app/models/Contact', 'app/models/Folder', 'app/models/Message', 'app/ui/messages/QuickReply', 'app/models/stores/TrackableMemory', '../../mocks/all'], function (require, exports, app, Attachment, Contact, Folder, Message, QuickReply, TrackableMemory, mocks) {
    mocks;
    app.run().then(function () {
        var user = app.get('user');
        user.login({
            username: 'test',
            password: 'pass'
        }).then(function () {
            Contact.setDefaultStore(new TrackableMemory());
            [
                'Fred Williams',
                'Ana Ivanovic',
                'Todd Smith',
                'Mark Halverson',
                'Prashanth Raj'
            ].forEach(function (name, index) {
                var nameParts = name.split(' ');
                Contact.store.put(new Contact({
                    id: index,
                    displayName: name,
                    image: (nameParts[0].charAt(0) + nameParts[1].charAt(0)),
                    accounts: [{ address: name.toLowerCase().replace(/\s/, '.') + '@test.com' }]
                }));
            });
            var attachmentStore = new TrackableMemory({ app: app });
            var message = new Message({
                app: app,
                from: 'fred.williams@test.com',
                to: [
                    'ana.ivanovic@test.com',
                    'todd.smith@test.com',
                    'mark.halverson@test.com',
                    'prashanth.raj@test.com'
                ],
                subject: 'Test message subject',
                body: 'Test message body'
            });
            Attachment.setDefaultStore(attachmentStore);
            user.set('folders', Folder.store);
            app.get('ui').set('view', new QuickReply({
                app: app,
                message: message
            }));
        });
    });
    return app;
});
//# sourceMappingURL=QuickReply.js.map