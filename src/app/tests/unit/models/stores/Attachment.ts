import assert = require('intern/chai!assert');
import Attachment = require('app/models/Attachment');
import AttachmentStore = require('app/models/stores/Attachment'); AttachmentStore;
import attachmentMock = require('../../../mocks/Attachment'); attachmentMock;
import mockData = require('../../../mocks/data/Attachment');
import Promise = require('mayhem/Promise');
import registerSuite = require('intern!object');
import User = require('app/auth/User');
import WebApplication = require('mayhem/WebApplication');

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
			Attachment.setDefaultApp(app);
			Attachment.setDefaultStore(new AttachmentStore({ app: app }));
		});
	});
}

registerSuite({
	name: 'app/models/stores/Attachment',

	beforeEach() {
		return createApp();
	},

	afterEach() {
		app.destroy();
	},

	'filter'() {
		var results = (<AttachmentStore> Attachment.store).filter({ messageId: 10 }).fetch();
		return Promise.all([
			results.then(function (results):void {
				assert.isDefined(results, 'Results should be defined');
				assert.strictEqual(results.length, mockData.length, 'Total length of results should be 2');

				results.forEach(function (result:Attachment, i:number) {
					var mock = mockData[i];
					assert.strictEqual(result.get('name'), mock.name, 'Result\'s name should match mock data');
					assert.strictEqual(result.get('type'), mock.type, 'Result\'s type should match mock data');
					assert.strictEqual(result.get('size'), mock.size, 'Result\'s size should match mock data');
				});
			}),
			results.totalLength.then(function (total:number) {
				assert.strictEqual(total, mockData.length, 'Reported totalLength should be 2');
			})
		]);
	}
});
