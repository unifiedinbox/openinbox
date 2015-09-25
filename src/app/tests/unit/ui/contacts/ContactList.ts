import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import Promise = require('mayhem/Promise');
import WebApplication = require('mayhem/WebApplication');

import ContactList = require('app/ui/contacts/ContactList');
import Contact = require('app/models/Contact');
import ContactStore = require('app/models/stores/Contact'); ContactStore;
import eTypeAdapter = require('app/models/adapters/eType');
import User = require('app/auth/User');
import util = require('app/util');

var app:WebApplication;
var contactList:ContactList;

function createApp(kwArgs?:HashMap<any>) {
	app = new WebApplication({
		apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT',
		name: 'Test',
		components: {
			i18n: { preload: [ 'app/nls/main' ] },
			router: null,
			ui: { view: null },
			user: {
				constructor: 'app/auth/User'
			}
		}
	});

	return app.run().then(function () {
		return (<User> (<any> app).get('user')).login({ username: 'test', password: 'test' }).then(() => {
			Contact.setDefaultApp(app);
			Contact.setDefaultStore(new ContactStore({ app: app }));
			// fetch and remove first to get rid of mock data that is inserted upon the fetch.
			// because this is a RequestMemory it will not try to fetch again.
			return util.removeAll(Contact.store).then(() => {
				contactList = new ContactList(lang.mixin(<HashMap<any>>{ app: app, collection: Contact.store }, kwArgs));
				app.get('ui').set('view', contactList);
			});
		});
	});
}

var imageUrl = 'https://avatars0.githubusercontent.com/u/78551?v=3&s=460';

function createContact(kwArgs?:HashMap<any>) {
	return new Contact(lang.mixin(<HashMap<any>>{}, {
		id: 1,
		displayName: 'Bob Smith',
		image: imageUrl,
		accounts: [ { eType: 'E' }, { eType: 'M' } ]
	}, kwArgs));
}

function testConnectionType(contactList:ContactList, connectionType:string) {
	return Contact.store.add(createContact({
		accounts: connectionType ? [ { eType: connectionType } ] : [],
		app: contactList.get('app')
	})).then(function () {
		if (connectionType) {
			var connectionTypeString = eTypeAdapter.toConnectionType(connectionType);
			assert.notStrictEqual(
				(<HTMLElement> contactList.get('firstNode').querySelector('.connection-types > span')).className
					.indexOf('connection-' + connectionTypeString),
				-1,
				'Widget node should contain connection-' + connectionTypeString + ' class');
		}
		else {
			assert.isNull(<HTMLSpanElement> contactList.get('firstNode').querySelector('.connection-types > span'));
		}
	});
}

function testSearch(search:string):IPromise<void> {
	contactList.set('search', search);

	return contactList.get('listView').get('collection').fetch().then(function (storeItems) {
		var storeValues = storeItems.map(
			(contact:Contact) => contact.get('displayName')
		);
		var domNodes = contactList.get('firstNode').querySelectorAll('.dgrid-row');
		var uiValues = Array.prototype.slice.apply(domNodes).map((node:HTMLElement) => node.textContent);

		assert.sameMembers(uiValues, storeValues);
	});
}

registerSuite({
	name: 'app/ui/contacts/ContactList',

	'get/set tests': {
		beforeEach() {
			return createApp();
		},

		afterEach() {
			return util.removeAll(Contact.store).then(function () {
				app.destroy();
			});
		},

		connectionTypeNone() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			return testConnectionType(contactList, null);
		},

		connectionTypeEmail() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			return testConnectionType(contactList, 'E');
		},

		connectionTypeFacebook() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			return testConnectionType(contactList, 'M');
		},

		connectionTypeTwitter() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			return testConnectionType(contactList, 'A');
		},

		connectionTypeLinkedin() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			return testConnectionType(contactList, 'L');
		},

		displayName() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			Contact.store.add(createContact({
				displayName: 'Bob',
				app: app
			}));

			var identifierNode = <HTMLElement> contactList.get('firstNode').querySelector('.identifier');
			assert.strictEqual(identifierNode.textContent.trim(), 'Bob',
					'Text in contactList should match what was set');
		}
	},

	'search and value tests': {
		beforeEach() {
			return createApp();
		},

		afterEach() {
			return util.removeAll(Contact.store).then(function () {
				app.destroy();
			});
		},

		'search, successful values'() {
			Contact.store.add(createContact({
				displayName: 'Bob Smith',
				app: app
			}));
			return testSearch('Bob');
		},

		'search, unsuccessful values'() {
			Contact.store.add(createContact({
				displayName: 'Bob Smith',
				app: app
			}));
			return testSearch('Fred');
		},

		'set selected values using setter'() {
			var contact1 = createContact({
				id: 1,
				displayName: 'Bob Smith',
				accounts: [ { eType: 'E' } ],
				app: app
			});

			var contact2 = createContact({
				id: 2,
				displayName: 'Fred Smith',
				accounts: [ { eType: 'M' } ],
				app: app
			});

			return Promise.all([
				Contact.store.add(contact1),
				Contact.store.add(contact2)
			]).then(() => {
				contactList.set('value', [contact1]);
				assert.strictEqual(contactList.get('firstNode').querySelectorAll('.ContactRow.selected').length, 1);
			});
		}
	}
});
