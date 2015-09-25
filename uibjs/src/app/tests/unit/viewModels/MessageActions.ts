import assert = require('intern/chai!assert');
import MessageActions = require('app/viewModels/MessageActions');
import registerSuite = require('intern!object');
import WebApplication = require('mayhem/WebApplication');

var app:WebApplication;
var model:MessageActions;

registerSuite({
	name: 'app/viewModels/MessageActions',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	'static methods': {
		getDefaultExcludedFolders():void {
			var excluded:string[] = MessageActions.getDefaultExcludedFolders();

			assert.sameMembers(excluded, [ 'Drafts', 'Outbox', 'Sent', 'Archive' ],
				'Drafts, Outbox, Sent, and Archive should be excluded by default.');

			excluded = MessageActions.getDefaultExcludedFolders([ 'Inbox' ]);
			assert.include(excluded, 'Inbox', 'Passed-in folders should also be in the returned array.');

			excluded = MessageActions.getDefaultExcludedFolders([ 'Drafts' ]);
			assert.sameMembers(excluded, [ 'Drafts', 'Outbox', 'Sent', 'Archive' ],
				'Duplicate folder names should be ignored.');
		}
	},

	'getters/setters': {
		markAsActions():void {
			var length:number = (<any> model.get('markAsActions')).length;
			assert.equal(length, 6, 'All six actions should be available by default.');

			model.set('markAsActions', [ 'read', 'unread', 'whitelist' ]);
			length = (<any> model.get('markAsActions')).length;
			assert.equal(length, 3, 'Only the specified actions should be returned.');

			(<any> model.get('markAsActions')).forEach(function (action:any):void {
				assert.isTrue(typeof action.iconClass === 'string', '`iconClass` should be provided');
				assert.isTrue(typeof action.property === 'string', '`property` should be provided.');
				assert.isTrue(typeof action.displayCondition === 'boolean', '`displayCondition` should be provided.');
			});
		},

		stateClasses():void {
			assert.equal(model.get('stateClasses'), 'is-hidden', 'State class should be `is-hidden` by default.');

			model.set('isOpen', true);
			assert.equal(model.get('stateClasses'), '', 'State class should be empty when `isOpen` is true.');
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

	return app.run().then(function () {
		model = new MessageActions({
			app: app
		});
	});
}
