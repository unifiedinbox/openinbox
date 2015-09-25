import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import Contact = require('app/models/Contact');
import ContactProxy = require('app/viewModels/MasterSearch');
import ContactStore = require('app/models/stores/Contact');
import MasterSearch = require('app/ui/search/MasterSearch');
import User = require('app/auth/User');
import util = require('app/util');
import WebApplication = require('mayhem/WebApplication');

var app:WebApplication;
var search:MasterSearch;

registerSuite({
	name: 'app/ui/MasterSearch',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	searchFiltering: {
		fullName():IPromise<void> {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			search.set('search', 'Firstname Lastn');
			return testField('displayName', 'Firstname Lastn', 'Full names should match.');
		},

		textCase():IPromise<void> {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var message = 'The search should ignore the text case of the user input.';
			search.set('search', 'user');
			return testField('displayName', 'user', message, true);
		}
	}
});

function getResults(callback:Function):IPromise<void> {
	return search.get('searchResults').then(function (contacts:Contact[]):void {
		assert.isTrue(!!contacts.length);
		contacts.forEach(<any> callback);
	});
}

function testField(name:string, search:string, message:string = '', ignoreCase:boolean = false):IPromise<void> {
	return getResults(function (contact:Contact):void {
		var field:string = <any> contact.get(name);

		if (ignoreCase) {
			field = field.toLowerCase();
		}

		assert.equal(field.indexOf(search), 0, message);
	});
}

function createApp(kwArgs?:HashMap<any>) {
	app = new WebApplication({
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

	Contact.setDefaultApp(app);
	Contact.setDefaultStore(new ContactStore({ app: app }));

	return app.run().then(function () {
		return (<User> (<any> app).get('user')).login({ username: 'test', password: 'test' }).then(() => {
			return resetStore().then(() => {
				search = new MasterSearch(lang.mixin(<HashMap<any>>{}, kwArgs, {
					app: app,
					collection: ContactProxy.forCollection(Contact.store),
					searchPlaceholder: (<any> app.get('i18n')).get('messages').searchPlaceholder(),
				}));

				app.get('ui').set('view', search);
			});
		});
	});
}

function resetStore():IPromise<void> {
	return util.removeAll(Contact.store).then(() => {
		var index:number = 0;
		[
			'Firstname Lastname',
			'User McUserton',
			'Chester Tester',
			'Esther Tester',
			'Lester McTester',
			'Tester McTesterson'
		].forEach(function (name:string):void {
			var nameParts = name.split(' ');
			Contact.store.put(new Contact({
				id: index,
				displayName: name,
				image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
			}));
			index++;
		});
	});
}
