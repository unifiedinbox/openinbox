import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import WebApplication = require('mayhem/WebApplication');
import Attachment = require('app/models/Attachment');
import Contact = require('app/models/Contact');
import Folder = require('app/models/Folder');
import Message = require('app/models/Message');
import MessageProxy = require('app/viewModels/MessageList');
import Observable = require('mayhem/Observable');
import Promise = require('mayhem/Promise');
import TrackableMemory = require('app/models/stores/TrackableMemory');

// Override the default scenario so the tests can execute properly.
import MessageScenarios = require('../../support/scenarios/Message'); MessageScenarios;

var app:WebApplication;
var message:MessageProxy;

registerSuite({
	name: 'app/viewModels/MessageList',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	rowType: {
		none():IPromise<void> {
			return message.get('rowType').then(function (type:string):void {
				assert.equal(type, 'none');
			});
		},

		draft():IPromise<void> {
			message.set('messageType', 'c');
			return message.get('rowType').then(function (type:string):void {
				assert.equal(type, 'draft');
			});
		},

		sent():IPromise<void[]> {
			var promises:IPromise<void>[] = [];

			message.set('folderId', 1);
			promises.push(message.get('rowType').then(function (type:string):void {
				assert.equal(type, 'sent');
			}));

			message.set('folderId', 2);
			promises.push(message.get('rowType').then(function (type:string):void {
				assert.equal(type, 'sent');
			}));

			return Promise.all(promises);
		}
	},

	contacts: {
		typeNone():IPromise<void[]> {
			var promises:IPromise<void>[] = [];

			promises.push(testParticipants('BE', 'Bill Evans'));

			message.set('to', [ 'Miles Davis' ]);
			promises.push(testParticipants('BE', 'Bill, Miles'));

			message.set('to', [ 'Miles Davis', 'John Coltrane' ]);
			promises.push(testParticipants('BE', 'Bill Evans', 2));

			message.set('from', 'cadderley');
			message.set('to', [ 'cadderley' ]);
			promises.push(testParticipants('', 'cadderley, cadderley'));

			return Promise.all(promises);
		},

		typeDraft():IPromise<void> {
			message.set('messageType', 'c');
			return testParticipants('PM', null, null, 'Draft');
		},

		typeSent():IPromise<void[]> {
			var promises:IPromise<void>[] = [];

			message.set('to', [ 'Scott LaFaro' ]);
			message.set('folderId', 1);
			promises.push(testParticipants('PM', 'Scott LaFaro'));

			message.set('to', [ 'Scott LaFaro', 'Dave Brubeck' ]);
			promises.push(testParticipants('PM', 'Scott LaFaro, Dave Brubeck'));

			return Promise.all(promises);
		}
	},

	dates: {
		isScheduled():void {
			assert.isFalse(message.get('isScheduled'));

			message.set('date', new Date(Date.now() * 1.03));
			assert.isTrue(message.get('isScheduled'));
		},

		dateLabel():void {
			var i18n = <any> app.get('i18n');
			var format:{ datePattern:string; timePattern:string; } = {
				datePattern: 'MMM d',
				timePattern: 'h:mma'
			};

			assert.equal(message.get('dateLabel'), i18n.formatDate(message.get('date'), format));

			format.datePattern = 'yyyy MMM d';
			message.set('date', new Date(Date.now() * 1.03));
			assert.equal(message.get('dateLabel'), i18n.formatDate(message.get('date'), format));
		},

		smartDate():void {
			var now:number = Date.now();
			var date:Date;

			assert.equal(message.get('smartDate'), '0m');

			message.set('date', new Date(now - 120000));
			assert.equal(message.get('smartDate'), '2m');

			message.set('date', new Date(now - 7200000));
			assert.equal(message.get('smartDate'), '2h');

			message.set('date', new Date(now - (6 * 86400000)));
			assert.equal(message.get('smartDate'), '6d');

			date = new Date(now - (7 * 86400000));
			message.set('date', date);
			assert.equal(message.get('smartDate'), date.toLocaleDateString());
		},
	},

	cssClassGetters: {
		privacyIconClass():void {
			assert.equal(message.get('privacyIconClass'), 'MessageRow-privacy--team');

			message.set('commentCount', 5);
			assert.sameMembers((<any> message.get('privacyIconClass')).split(' '),
				[ 'MessageRow-privacy--team', 'has-comments' ]);

			message.set('commentCount', 0);
			message.set('privacyStatus', 'business');
			assert.equal(message.get('privacyIconClass'), 'MessageRow-privacy--business');
		},

		stateClasses():void {
			var classes:string[] = [ 'is-read', 'is-selected' ];

			assert.equal(message.get('stateClasses'), 'is-unread');

			message.set('isRead', true);
			assert.equal(message.get('stateClasses'), 'is-read');

			message.set('isSelected', true);
			assert.sameMembers((<any> message.get('stateClasses')).split(' '), classes);

			message.set('isStarred', true);
			classes.push('is-starred');
			assert.sameMembers((<any> message.get('stateClasses')).split(' '), classes);

			message.set('forwarded', true);
			classes.push('is-forwarded');
			assert.sameMembers((<any> message.get('stateClasses')).split(' '), classes);

			message.set('replied', true);
			classes.push('is-replied');
			assert.sameMembers((<any> message.get('stateClasses')).split(' '), classes);
		}
	}
});

function testHasAttachments(expected:boolean = false):IPromise<void> {
	return (<any> message.get('hasAttachments')).then(function (value:boolean):void {
		assert.equal(value, expected);
	});
}

function testParticipants(image:string, text:string, participantCount:number = 0, label:string = ''):IPromise<void> {
	return (<any> message.get('contacts')).then(function (data:HashMap<any>):void {
		assert.equal((<any> data).image, image);
		assert.equal((<any> data).text, text);
		assert.equal((<any> data).participantCount, participantCount);

		if (label) {
			assert.equal((<any> data).label, label);
		}
	});
}

function createApp(kwArgs?:HashMap<any>):IPromise<void> {
	app = new WebApplication({
		name: 'Test',
		components: {
			i18n: { preload: [ 'app/nls/main' ] },
			router: null,
			ui: { view: null }
		}
	});

	Attachment.setDefaultApp(app);
	Attachment.setDefaultStore(<any> new TrackableMemory());
	Contact.setDefaultApp(app);
	Contact.setDefaultStore(<any> new TrackableMemory());
	Folder.setDefaultApp(app);
	Folder.setDefaultStore(<any> new TrackableMemory());
	Message.setDefaultApp(app);
	Message.setDefaultStore(<any> new TrackableMemory());

	return app.run().then(function () {
		return setData();
	});
}

function setData():IPromise<void> {
	var user = new Observable();
	user.set('data', new Observable({
		fullName: 'Paul Motian',
		image: 'PM'
	}));
	app.set('user', user);

	var contacts = [
		{ id: 0, displayName: 'Bill Evans', email: 'bevans@riverside.com', image: 'BE' },
		{ id: 1, displayName: 'Miles Davis', email: 'mdavis@columbia.com', image: 'MD' },
		{ id: 2, displayName: 'John Coltrane', email: 'jcoltrane@bluenote.com', image: 'JC' },
		{ id: 3, displayName: 'cadderley', email: 'cadderley@prestige.com' }
	];
	var folders = [
		{ id: 0, name: 'Inbox' },
		{ id: 1, name: 'Sent' },
		{ id: 2, name: 'Outbox' }
	];
	var promises:any[] = contacts.map(function (data:any):IPromise<Contact> {
		return Contact.store.put(new Contact(data));
	});
	promises.concat(folders.map(function (data:any):IPromise<Folder> {
		return Folder.store.put(new Folder(data));
	}));

	return Promise.all(promises).then(function () {
		return Message.store.put(new Message({
			id: 0,
			folderId: 0,
			subject: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor vel sem eu consequat.',
			date: new Date(),
			from: 'Bill Evans',
			privacyStatus: 'team'
		})).then(function (item:Message):void {
			message = new MessageProxy({ target: item });
		});
	});
}
