define(["require", "exports", 'mayhem/Promise', '../app', 'app/models/Contact', 'app/models/stores/Contact', 'app/tests/mocks/all', 'app/ui/search/MasterSearch'], function (require, exports, Promise, app, Contact, ContactStore, mocks, MasterSearch) {
    ContactStore;
    mocks;
    Contact.setDefaultApp(app);
    Contact.store.app = app;
    app.run().then(function () {
        return app.get('user').login({ username: 'test', password: 'test' });
    }).then(function () {
        return Contact.store.fetch();
    }).then(function (oldContacts) {
        var promises = [];
        for (var i = oldContacts.length; i--;) {
            promises.push(oldContacts[i].remove());
        }
        return Promise.all(promises);
    }).then(function () {
        [
            'Nita Tune',
            'Carrie Rice',
            'Torrey Rice',
            'Dylan Schiemann',
            'Ken Franqueiro',
            'Matt Wistrand',
            'James Donaghue'
        ].forEach(function (name) {
            var nameParts = name.split(' ');
            Contact.store.add(new Contact({
                displayName: name,
                image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
            }));
        });
        var search = new MasterSearch({
            app: app,
            collection: Contact.store,
            searchPlaceholder: app.get('i18n').get('messages').searchPlaceholder()
        });
        app.get('ui').set('view', search);
        var node = document.getElementById('value');
        app.get('ui').on('searchSubmit', function (event) {
            var text = event.value;
            if (event.item) {
                text += ' (Contact id: ' + event.item.get('id') + ')';
            }
            node.textContent = text;
        });
    });
    return app;
});
//# sourceMappingURL=MasterSearch.js.map