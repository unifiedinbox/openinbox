import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import WebApplication = require('mayhem/WebApplication');
// Since SearchWidget is an abstract class, we need a class that extends it to test it.
// Rather than build a mock class, the tests instead will rely on MasterSearch.
import MasterSearch = require('app/ui/search/MasterSearch');
import NavigableSearchWidget = require('app/ui/search/NavigableSearchWidget'); // for SearchEvent
import TrackableMemory = require('app/models/stores/TrackableMemory');
import Contact = require('app/models/Contact');
import ContactProxy = require('app/viewModels/MasterSearch');

var app:WebApplication;
var search:MasterSearch;

registerSuite({
	name: 'app/ui/SearchWidget',

	// TODO: when there is a separate module for keyboard navigation, this group will be unnecessary.
	'results navigation': {
		beforeEach():IPromise<void> {
			return createApp().then(function () {
				search.set('search', 'Tester');
			});
		},

		afterEach() {
			app.destroy();
		},

		searchResults():IPromise<void> {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			return search.get('searchResults').then(function (contacts:Contact[]):void {
				contacts.forEach(function (contact:Contact):void {
					assert.notStrictEqual(contact.get('displayName').indexOf('Tester'), -1,
						'The filtered results should match the search value.');
				});
			});
		},

		nextRow: {
			initial():IPromise<void> {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				search.nextRow();
				return search.get('searchResults').then(function (contacts:Contact[]):void {
					contacts.forEach(function (contact:Contact, index:number):void {
						var isHighlighted:boolean = <any> contact.get('isHighlighted');

						assert.isTrue(index === 0 ? isHighlighted : !isHighlighted,
							'Only the first row should be highlighted.');
					});
				});
			},

			last():IPromise<void> {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				return search.get('searchResults').then(function (contacts:Contact[]):void {
					navigateToRow(contacts.length);

					contacts.forEach(function (contact:Contact, index:number):void {
						var isHighlighted:boolean = <any> contact.get('isHighlighted');

						assert.isTrue(index === 0 ? isHighlighted : !isHighlighted,
							'Navigating forward from the final result should highlight the first.');
					});
				});
			}
		},

		previousRow: {
			initial():IPromise<void> {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				search.previousRow();
				return search.get('searchResults').then(function (contacts:Contact[]):void {
					contacts.forEach(function (contact:Contact, index:number):void {
						var isHighlighted:boolean = <any> contact.get('isHighlighted');

						assert.isTrue(index === contacts.length - 1 ? isHighlighted : !isHighlighted,
							'Navigating backward from the first result should highlight the last.');
					});
				});
			},

			index():IPromise<void> {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				return search.get('searchResults').then(function (contacts:Contact[]):void {
					navigateToRow(contacts.length - 1);
					search.previousRow();

					contacts.forEach(function (contact:Contact, index:number):void {
						var isHighlighted:boolean = <any> contact.get('isHighlighted');

						assert.isTrue(index === contacts.length - 2 ? isHighlighted : !isHighlighted,
							'Only the second-to-last row should be highlighted.');
					});
				});
			}
		},

		selectRow():IPromise<void> {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var dfd = this.async(1000);

			search.previousRow();
			search.get('searchResults').then(function (contacts:Contact[]):void {
				search.on('searchSubmit', dfd.callback(function (event:NavigableSearchWidget.SearchEvent<Contact>) {
					assert.isDefined(event.item, 'event.item should be defined when an item is selected');
					assert.strictEqual(event.item, contacts[contacts.length - 1],
						'Reported item should be the last in the list');
				}));

				search.selectRow();
			});

			return dfd;
		},

		hideList():void {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var node = search.get('firstNode').querySelector('.ContactList');
			search.previousRow();
			search.selectRow();
			assert.isTrue((<HTMLElement> node).classList.contains('is-hidden'));
		}
	}
});

function navigateToRow(index:number):void {
	while (index >= 0) {
		search.nextRow();
		index -= 1;
	}
}

function createApp(kwArgs?:HashMap<any>) {
	app = new WebApplication({
		name: 'Test',
		components: {
			i18n: { preload: [ 'app/nls/main' ] },
			router: null,
			ui: { view: null }
		}
	});

	Contact.setDefaultApp(app);

	return app.run().then(function () {
		search = new MasterSearch(lang.mixin(<HashMap<any>>{}, kwArgs, {
			app: app,
			collection: ContactProxy.forCollection(resetStore()),
			searchPlaceholder: (<any> app.get('i18n')).get('messages').searchPlaceholder()
		}));

		app.get('ui').set('view', search);
	});
}

function resetStore():dstore.ICollection<Contact> {
	var store = new (<any> TrackableMemory)();
	[
		'Firstname Lastname',
		'User McUserton',
		'Chester Tester',
		'Esther Tester',
		'Lester McTester',
		'Tester McTesterson'
	].forEach(function (name:string):void {
		var nameParts = name.split(' ');

		store.put(new Contact({
			displayName: name,
			image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
		}));
	});

	return store;
}
