import assert = require('intern/chai!assert');
import Inbox = require('app/viewModels/Inbox');
import Message = require('app/models/Message');
import MessageActionsViewModel = require('app/viewModels/MessageActions');
import MessageFiltersViewModel = require('app/viewModels/MessageFilters');
import MessageStore = require('app/models/stores/Message');
import registerSuite = require('intern!object');
import WebApplication = require('mayhem/WebApplication');

var app:WebApplication;
var model:Inbox;

// Message data should be mocked for the tests
import mocks = require('../../mocks/all'); mocks;

registerSuite({
	name: 'app/viewModels/Inbox',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	'getters/setters': {
		isInSearchMode():void {
			assert.isFalse(model.get('isInSearchMode'));

			model.set('masterSearchIsFocused', true);
			assert.isTrue(model.get('isInSearchMode'));

			model.set('masterSearchIsFocused', false);
			assert.isFalse(model.get('isInSearchMode'));

			model.set('masterSearchValue', 'Lorem ipsum');
			assert.isTrue(model.get('isInSearchMode'));
		},

		visibility: {
			initial():void {
				assert.isTrue(model.get('isMessageListVisible'));
				assert.isFalse(model.get('isInboxZeroVisible'));
			},

			'search has focus': {
				'no search value'():void {
					model.set({
						masterSearchIsFocused: true,
						masterSearchValue: ''
					});

					assert.isFalse(model.get('isMessageListVisible'));
					assert.isFalse(model.get('isInboxZeroVisible'));
				},

				'search is fetching'():void {
					model.set({
						isFetching: true,
						masterSearchValue: 'Lorem ipsum',
						masterSearchIsFocused: true
					});

					assert.isTrue(model.get('isMessageListVisible'));
					assert.isFalse(model.get('isInboxZeroVisible'));
				}
			},

			'search does not have focus': {
				'when in search mode'():void {
					model.set({
						masterSearchValue: 'Lorem ipsum',
						messageCount: 0,
						searchResultCount: 0
					});

					assert.isFalse(model.get('isMessageListVisible'));
					assert.isTrue(model.get('isInboxZeroVisible'));

					model.set('searchResultCount', 100);
					assert.isTrue(model.get('isMessageListVisible'));
					assert.isFalse(model.get('isInboxZeroVisible'));
				},

				'when not in search mode'():void {
					model.set({
						messageCount: 0,
						searchResultCount: 0
					});

					assert.isFalse(model.get('isMessageListVisible'));
					assert.isTrue(model.get('isInboxZeroVisible'));

					model.set('messageCount', 100);
					assert.isTrue(model.get('isMessageListVisible'));
					assert.isFalse(model.get('isInboxZeroVisible'));
				}
			}
		}
	}
});

function createApp(kwArgs?:HashMap<any>):IPromise<void> {
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

	Message.setDefaultApp(app);
	Message.setDefaultStore(new MessageStore({ app: app }));

	return app.run().then(function () {
		model = new Inbox({
			app: app,
			messageActionsModel: new MessageActionsViewModel({
				app: app,
				hideDistribute: true,
				hideMore: true,
				isOpen: true
			}),
			messageFiltersModel: new MessageFiltersViewModel({
				app: app
			})
		});
	});
}
