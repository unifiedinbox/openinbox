import app = require('../app');
import Attachment = require('app/models/Attachment');
import Contact = require('app/models/Contact');
import Folder = require('app/models/Folder');
import Message = require('app/models/Message');
import QuickReply = require('app/ui/messages/QuickReply');
import TrackableMemory = require('app/models/stores/TrackableMemory');

// comment out this line to disable service mocks
import mocks = require('../../mocks/all'); mocks;

app.run().then(function () {
	var user = <any> app.get('user');

	user.login({
		username: 'test',
		password: 'pass'
	}).then(function () {
		Contact.setDefaultStore(<any> new TrackableMemory());
		[
			'Fred Williams',
			'Ana Ivanovic',
			'Todd Smith',
			'Mark Halverson',
			'Prashanth Raj'
		].forEach(function (name:string, index:number):void {
			var nameParts = name.split(' ');

			Contact.store.put(new Contact({
				id: index,
				displayName: name,
				image: (nameParts[0].charAt(0) + nameParts[1].charAt(0)),
				accounts: [ { address: name.toLowerCase().replace(/\s/, '.') + '@test.com' } ]
			}));
		});

		var attachmentStore:any = new TrackableMemory({ app: app });
		var message:Message = new Message({
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

export = app;
