import assert = require('intern/chai!assert');
import Conversation = require('app/models/Conversation');
import ConversationStore = require('app/models/stores/Conversation'); ConversationStore;
import conversationMock = require('../../../mocks/showConversation'); conversationMock;
import mockData = require('../../../mocks/data/showConversation');
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
			Conversation.setDefaultApp(app);
			Conversation.setDefaultStore(new ConversationStore({ app: app }));
		});
	});
}

function assertYN(booleanValue:boolean, yn:string, message:string) {
	var expected = booleanValue ? 'y' : 'n';
	assert.strictEqual(yn, expected, message);
}

registerSuite({
	name: 'app/models/stores/Conversation',

	beforeEach() {
		return createApp();
	},

	afterEach() {
		app.destroy();
	},

	'filter'() {
		var messageId = 10;
		var results = (<ConversationStore> Conversation.store).filter({ messageId: messageId }).fetch();
		return Promise.all([
			results.then(function (results):void {
				assert.isDefined(results, 'Results should be defined');
				assert.strictEqual(results.length, mockData.length, 'Total length of results should be 2');

				results.forEach(function (result:Conversation, i:number) {
					var mock = mockData[i];

					assert.sameMembers(result.get('bcc'), mock.bcc, 'Result\'s bcc should match mock data');
					assert.strictEqual(result.get('body'), mock.body, 'Result\'s body should match mock data');
					assert.sameMembers(result.get('cc'), mock.cc, 'Result\'s cc should match mock data');
					// TODO: date
					assertYN(result.get('forwarded'), mock.forwarded, 'Result\'s forwarded should match mock data');
					assert.strictEqual(result.get('fromEmail'), mock.email_from,
						'Result\'s fromEmail should match mock\'s email_from');
					assert.strictEqual(result.get('fromName'), mock.from,
						'Result\'s fromName should match mock\'s from');
					assert.strictEqual(result.get('id'), mock.vchMessageID,
						'Result\'s id should match mock data\'s vchMessageID');
					assert.strictEqual(result.get('messageId'), messageId,
						'Result\'s messageId should match the messageId that was used as a filter');
					assertYN(result.get('replied'), mock.replied, 'Result\'s replied should match mock data');
					assert.strictEqual(result.get('subject'), mock.showsubject,
						'Result\'s subject should match mock\'s showsubject')
					assert.sameMembers(result.get('to'), mock.to, 'Result\'s to should match mock data');
				});
			}),
			results.totalLength.then(function (total:number) {
				assert.strictEqual(total, mockData.length, 'Reported totalLength should be 2');
			})
		]);
	}
});
