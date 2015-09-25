import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import WebApplication = require('mayhem/WebApplication');
import endpoints = require('app/endpoints');
import Contact = require('app/models/Contact');
import Conversation = require('app/models/Conversation');
import ConversationProxy = require('app/viewModels/ConversationList');
import Message = require('app/models/Message');
import TrackableMemory = require('app/models/stores/TrackableMemory');

var app:WebApplication;
var message:Message;
var model:Conversation;
var proxy:ConversationProxy;

registerSuite({
	name: 'app/viewModels/ConversationList',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	'getters/setters': {
		bcc():void {
			var expected = (<string[]> model.get('bcc')).join(', ');
			assert.equal(proxy.get('bcc'), expected);
		},

		cc():void {
			var expected = (<string[]> model.get('cc')).join(', ');
			assert.equal(proxy.get('cc'), expected);
		},

		to():void {
			var expected = (<string[]> model.get('to')).join(', ');
			assert.equal(proxy.get('to'), expected);
		},

		hasBcc():void {
			assert.isTrue(proxy.get('hasBcc'));

			model.set('bcc', []);
			assert.isFalse(proxy.get('hasBcc'));
		},

		hasCc():void {
			assert.isTrue(proxy.get('hasCc'));

			model.set('cc', []);
			assert.isFalse(proxy.get('hasCc'));
		},

		contactImage():IPromise<void> {
			return (<any> proxy.get('contactImage')).then(function (image:string):void {
				assert.equal(image, 'MD');
			});
		},

		message():IPromise<void> {
			return (<any> proxy.get('message')).then(function (actual:Message):void {
				assert.equal(actual, message);
			});
		},

		viewSourceLink():void {
			var expected:string = endpoints.viewMessageSource + '?messageId=' + model.get('messageId');
			assert.equal(proxy.get('viewSourceLink'), expected);
		}
	}
});

function createApp(kwArgs?:HashMap<any>):IPromise<void> {
	app = new WebApplication({
		name: 'Test',
		components: {
			i18n: { preload: [ 'app/nls/main' ] },
			router: null,
			ui: { view: null }
		}
	});

	Contact.setDefaultApp(app);
	Contact.setDefaultStore(<any> new TrackableMemory({ app: app }));
	Conversation.setDefaultApp(app);
	Conversation.setDefaultStore(<any> new TrackableMemory({ app: app }));
	Message.setDefaultApp(app);
	Message.setDefaultStore(<any> new TrackableMemory({ app: app }));

	return app.run().then(function () {
		return setData();
	});
}

function setData():IPromise<void> {
	Contact.store.put(new Contact({
		displayName: 'Miles Davis',
		image: 'MD'
	}));

	message = new Message({
		id: 23456
	});
	Message.store.put(message);

	return Conversation.store.put(new Conversation({
		bcc: [ 'Bill Evans', 'Paul Motian' ],
		body: 'Pellentesque pellentesque leo a auctor imperdiet. Nam nec hendrerit dolor. Duis fringilla massa at purus mollis pulvinar. Donec sit amet sollicitudin nibh, non lacinia diam. Quisque est eros, tincidunt quis elementum at, ultrices in lacus. Maecenas id tellus nec diam blandit rutrum. Cras in lectus sodales, dapibus ex vitae, eleifend erat. ',
		cc: [ 'Scott LaFaro' ],
		date: new Date(Date.now() * 0.999),
		forwarded: false,
		fromEmail: 'miles.davis@columbia.com',
		fromName: 'Miles Davis',
		id: 123456,
		messageId: 23456,
		replied: false,
		subject: 'Lorem ipsum dolor sit amet.',
		to: [ 'Keith Jarret', 'Ornette Coleman' ]
	})).then(function (conversation:Conversation):void {
		model = conversation;
		proxy = new ConversationProxy({
			app: app,
			target: conversation
		});
	});
}
