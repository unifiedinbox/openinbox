import app = require('../app');
import Contact = require('app/models/Contact');
import ContactStore = require('app/models/stores/Contact'); ContactStore;
import ContactList = require('app/ui/contacts/ContactList');
import User = require('app/auth/User');
import Memory = require('dstore/Memory');
import declare = require('dojo/_base/declare');

import mocks = require('app/tests/mocks/all'); mocks;

app.run().then(() => {
	return (<User> (<any> app).get('user')).login({ username: 'test', password: 'test' }).then(() => {
		Contact.setDefaultApp(app);
		(<any> Contact.store).app = app;

		Contact.store.add(new Contact({
			id: 1,
			app: app,
			displayName: 'Bob Smith',
			image: 'BS',
			accounts: [ { eType: 'E' }, { eType: 'M' } ]
		}));

		Contact.store.add(new Contact({
			id: 2,
			app: app,
			displayName: 'Todd Jones',
			image: 'TJ',
			accounts: [ { eType: 'E' }, { eType: 'M' } ]
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

export = app;
