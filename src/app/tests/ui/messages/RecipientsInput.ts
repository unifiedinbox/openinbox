import on = require('dojo/on');

import app = require('../app');
import Connection = require('app/models/Connection');
import Contact = require('app/models/Contact');
import TrackableMemory = require('app/models/stores/TrackableMemory');
import RecipientsInput = require('app/ui/messages/RecipientsInput');

import mocks = require('app/tests/mocks/all'); mocks;

app.run().then(function () {
	Contact.setDefaultApp(app);
	Contact.setDefaultStore(<any> new TrackableMemory({ data: [
		new Contact({
			id: 1,
			app: app,
			displayName: 'Bob Smith',
			image: 'BS',
			accounts: [ { eType: 'E', address: 'bob@smith.com' }, { eType: 'M', address: 'bob@smith.com' } ]
		}),

		new Contact({
			id: 2,
			app: app,
			displayName: 'Todd Jones',
			image: 'TJ',
			accounts: [ { eType: 'E', address: 'todd@jones.com' }, { eType: 'M', address: 'todd@jones.com' } ]
		}),

		new Contact({
			id: 3,
			app: app,
			displayName: 'Fred Williams',
			image: 'FW',
			accounts: [ { eType: 'E', address: 'fred@williams.com' } ]
		})
	] }));

	Connection.setDefaultApp(app);
	Connection.setDefaultStore(<any> new TrackableMemory({ data: [
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

	var user = <any> app.get('user');
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

		recipientsInput.on('recipientAdded', function (event:RecipientsInput.RecipientEvent) {
			var recipient = event.item;
			console.log('Recipient added: ', recipient.get('contact').get('displayName'));
		});

		recipientsInput.on('recipientRemoved', function (event:RecipientsInput.RecipientEvent) {
			var recipient = event.item;
			console.log('Recipient removed: ', recipient.get('contact').get('displayName'));
		});
	});
});
