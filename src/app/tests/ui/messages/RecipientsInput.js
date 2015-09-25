define(["require", "exports", 'dojo/on', '../app', 'app/models/Connection', 'app/models/Contact', 'app/models/stores/TrackableMemory', 'app/ui/messages/RecipientsInput', 'app/tests/mocks/all'], function (require, exports, on, app, Connection, Contact, TrackableMemory, RecipientsInput, mocks) {
    mocks;
    app.run().then(function () {
        Contact.setDefaultApp(app);
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
        var user = app.get('user');
        user.login({
            username: 'test',
            password: 'pass'
        }).then(function () {
            var recipientsInput = new RecipientsInput({
                app: app,
                contactsCollection: Contact.store
            });
            app.get('ui').set('view', recipientsInput);
            on(document.getElementById('setValue'), 'click', function () {
                recipientsInput.set('value', [
                    'mark@smith.com',
                    'jane@doe.com'
                ]);
            });
            on(document.getElementById('logValue'), 'click', function () {
                console.log(recipientsInput.get('value'));
            });
            recipientsInput.on('recipientAdded', function (event) {
                var recipient = event.item;
                console.log('Recipient added: ', recipient.get('contact').get('displayName'));
            });
            recipientsInput.on('recipientRemoved', function (event) {
                var recipient = event.item;
                console.log('Recipient removed: ', recipient.get('contact').get('displayName'));
            });
        });
    });
});
//# sourceMappingURL=RecipientsInput.js.map