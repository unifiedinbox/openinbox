import Promise = require('mayhem/Promise');
import app = require('../app');
import Contact = require('app/models/Contact');
import ContactStore = require('app/models/stores/Contact'); ContactStore;
import mocks = require('app/tests/mocks/all'); mocks;
import MasterSearch = require('app/ui/search/MasterSearch');
import NavigableSearchWidget = require('app/ui/search/NavigableSearchWidget'); // for SearchEvent

// Force any models to use the test app as the default
Contact.setDefaultApp(app);
(<any> Contact.store).app = app;

app.run().then(function () {
	return (<any> app.get('user')).login({ username: 'test', password: 'test' });
}).then(function () {
	return Contact.store.fetch();
}).then(function (oldContacts) {
	var promises:Promise<void>[] = [];
	for (var i = oldContacts.length; i--;) {
		promises.push(oldContacts[i].remove());
	}
	return Promise.all(promises);
}).then(function () {
	[
		'Nita Tune',
		'Carrie Rice',
		'Torrey Rice',
		'Dylan Schiemann',
		'Ken Franqueiro',
		'Matt Wistrand',
		'James Donaghue'
	].forEach(function (name:string) {
		var nameParts = name.split(' ');

		Contact.store.add(new Contact({
			displayName: name,
			image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
		}));
	});

	var search = new MasterSearch({
		app: app,
		collection: Contact.store,
		searchPlaceholder: (<any> app.get('i18n')).get('messages').searchPlaceholder()
	});

	app.get('ui').set('view', search);

	var node = document.getElementById('value');
	app.get('ui').on('searchSubmit', function (event:NavigableSearchWidget.SearchEvent<Contact>) {
		var text = event.value;

		if (event.item) {
			text += ' (Contact id: ' + event.item.get('id') + ')';
		}

		node.textContent = text;
	});
});

export = app;
