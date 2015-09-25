define(["require", "exports", '../app', 'app/models/Contact', 'app/models/stores/Contact', 'app/ui/contacts/ContactList', 'app/tests/mocks/all'], function (require, exports, app, Contact, ContactStore, ContactList, mocks) {
    ContactStore;
    mocks;
    app.run().then(function () {
        return app.get('user').login({ username: 'test', password: 'test' }).then(function () {
            Contact.setDefaultApp(app);
            Contact.store.app = app;
            Contact.store.add(new Contact({
                id: 1,
                app: app,
                displayName: 'Bob Smith',
                image: 'BS',
                accounts: [{ eType: 'E' }, { eType: 'M' }]
            }));
            Contact.store.add(new Contact({
                id: 2,
                app: app,
                displayName: 'Todd Jones',
                image: 'TJ',
                accounts: [{ eType: 'E' }, { eType: 'M' }]
            }));
            Contact.store.add(new Contact({
                id: 3,
                app: app,
                displayName: 'Fred Williams',
                image: 'FW',
                accounts: []
            }));
            var contactList = new ContactList({
                app: app,
                collection: Contact.store
            });
            app.get('ui').set('view', contactList);
        });
    });
    return app;
});
//# sourceMappingURL=ContactList.js.map