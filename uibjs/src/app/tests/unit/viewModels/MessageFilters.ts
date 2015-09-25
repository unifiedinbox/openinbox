import assert = require('intern/chai!assert');
import declare = require('dojo/_base/declare');
import MessageFilters = require('app/viewModels/MessageFilters');
import Promise = require('mayhem/Promise');
import registerSuite = require('intern!object');
import TrackableMemory = require('app/models/stores/TrackableMemory');
import WebApplication = require('mayhem/WebApplication');

var app:WebApplication;
var model:MessageFilters;

registerSuite({
	name: 'app/viewModels/MessageFilters',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	counts():IPromise<void[]> {
		var promises:IPromise<void>[] = [];

		promises.push((<any> model.get('counts')).then(function (counts:HashMap<any>):void {
			assert.equal(Object.keys(counts).length, 0,
				'No counts should be returned when `isOpen` is false.');
		}));

		model.set('isOpen', true);
		promises.push((<any> model.get('counts')).then(function (counts:HashMap<string>):void {
			var pattern = /^\s\(\d+\)$/;

			Object.keys(counts).forEach(function (key:string):void {
				assert.isTrue(pattern.test(counts[key]));
			});
		}));

		return Promise.all(promises);
	},

	searchActions():void {
		var searchActions:Array<{ filter:string; text:string; }> = <any> model.get('searchActions');
		var messages = (<any> app.get('i18n')).get('messages');

		searchActions.forEach(function (action:{ filter:string; text:string; }):void {
			assert.equal(action.text, messages[action.filter]());
		});
	},

	selectedFilterLabel():void {
		var messages = (<any> app.get('i18n')).get('messages');

		assert.equal(model.get('selectedFilterLabel'), messages.allMessages(),
			'The default filter should be marked as ' + messages.allMessages());

		model.set('selectedFilter', 'myMessages');
		assert.equal(model.get('selectedFilterLabel'), messages.myMessages());

		model.set('selectedFilter', 'newMessages');
		assert.equal(model.get('selectedFilterLabel'), messages.newMessages());
	},

	selectedSortLabel():void {
		var messages = (<any> app.get('i18n')).get('messages');

		assert.equal(model.get('selectedSortLabel'), messages.date(),
			'The default sorting should be marked as ' + messages.date());

		model.set('selectedSort', 'sender');
		assert.equal(model.get('selectedSortLabel'), messages.sender());

		model.set('selectedSort', 'date');
		assert.equal(model.get('selectedSortLabel'), messages.date());
	},

	linkText():void {
		var messages = (<any> app.get('i18n')).get('messages');

		model.set('selectedFilter', 'myMessages');
		model.set('selectedSort', 'sender');

		assert.equal(model.get('linkText'), messages.filterBarLabel({
			filter: messages.myMessages(),
			sort: messages.sender()
		}));
	},

	stateClasses():void {
		assert.include((<any> model.get('stateClasses')).split(' '), 'is-closed',
			'State classes should be "is-closed" by default.');

		model.set('isOpen', true);
		assert.include((<any> model.get('stateClasses')).split(' '), 'is-open',
			'State classes should be "is-open" when `isOpen` is `true`.');

		model.set('selectedFilter', 'newMessages');
		assert.include((<any> model.get('stateClasses')).split(' '), 'is-filtered--newMessages',
			'State classes should contain the appropriate `is-filtered` modifier.');

		model.set('isOpen', false);
		model.set('isInSearchMode', true);
		assert.sameMembers(<any> model.get('stateClasses').split(' '),
			[ 'is-open', 'is-inSearchMode', 'is-filtered--allResults' ],
			'Should have open, inSearchMode, and appropriate search filter states.');

		model.set('isInSearchMode', false);
		assert.sameMembers(<any> model.get('stateClasses').split(' '),
			[ 'is-open', 'is-filtered--newMessages' ],
			'Toggling search mode should restore the standard filter state.');
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
		model = new MessageFilters({
			app: app,
			messages: new (<any> declare(TrackableMemory, {
				getMessageCounts():IPromise<HashMap<number>> {
					return <any> Promise.resolve({
						unreadMessageCount: 10,
						newMessageCount: 3,
						myMessageCount: 4
					});
				}
			}))()
		});
	});
}
