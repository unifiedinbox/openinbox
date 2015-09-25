import app = require('./app');
import Container = require('mayhem/ui/Container');
import Attachment = require('app/models/Attachment');
import Connection = require('app/models/Connection');
import Contact = require('app/models/Contact');
import ContactStore = require('app/models/stores/Contact'); ContactStore;
import Folder = require('app/models/Folder');
import FolderStore = require('app/models/stores/Folder'); FolderStore;
import Message = require('app/models/Message');
import MessageProxy = require('app/viewModels/MessageComposition');
import MessageStore = require('app/models/stores/Message'); MessageStore;
import MessageComposition = require('app/ui/MessageComposition');
import TrackableMemory = require('app/models/stores/TrackableMemory');

import mocks = require('../mocks/all'); mocks;

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

app.run().then(function () {
	var user = <any> app.get('user');
	user.login({
		username: 'test',
		password: 'pass'
	}).then(function () {
		Message.setDefaultApp(app);
		(<any> Message.store).app = app;

		var attachmentStore:any = new TrackableMemory({ app: app });

		Attachment.setDefaultApp(app);
		Attachment.setDefaultStore(attachmentStore);
		Contact.setDefaultApp(app);
		(<any> Contact.store).app = app;
		Folder.setDefaultApp(app);
		(<any> Folder.store).app = app;
		(<any> Message.store).app = app;
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

export = app;
