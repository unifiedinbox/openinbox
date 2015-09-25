import Promise = require('mayhem/Promise');
import WebApplication = require('mayhem/WebApplication');
import assert = require('intern/chai!assert');
import Contact = require('app/models/Contact');
import ContactStore = require('app/models/stores/Contact'); ContactStore;
import contactsMock = require('../../../mocks/getContactsList'); contactsMock;
import mockData = require('../../../mocks/data/getContactsList');
import registerSuite = require('intern!object');
import User = require('app/auth/User');

var app:WebApplication;

function createApp() {
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

	return app.run().then(() => {
		return (<User> (<any> app).get('user')).login({ username: 'test', password: 'test' }).then(() => {
			Contact.setDefaultApp(app);
			Contact.setDefaultStore(new ContactStore({ app: app }));
		});
	});
}

registerSuite({
	name: 'app/models/stores/Contacts',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	'fetch'() {
		var results = Contact.store.fetch();
		return Promise.all([
			results.then(function (results) {
				assert.strictEqual(results.length, mockData.length, 'Total length of results should be 2');

				results.forEach(function (result:Contact, i:number) {
					var mock = mockData[i];
					assert.strictEqual(result.get('id'), mock.intIndx, 'Result\'s id should match mock data');
					assert.strictEqual(result.get('displayName'), mock.name, 'Result\'s displayName should match mock data');
					assert.strictEqual(result.get('image'), mock.imagepath, 'Result\'s image should match mock data');
				});
			}),
			results.totalLength.then(function (total:number) {
				assert.strictEqual(total, mockData.length, 'Reported totalLength should be 2');
			})
		]);
	}
});
