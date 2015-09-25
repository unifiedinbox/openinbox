import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import Promise = require('mayhem/Promise');
import WebApplication = require('mayhem/WebApplication');
import GroupedConnectionList = require('app/ui/connections/GroupedConnectionList');
import Connection = require('app/models/Connection');
import ConnectionStore = require('app/models/stores/Connection');
import eTypeAdapter = require('app/models/adapters/eType');
import Memory = require('dstore/Memory');
import Trackable = require('dstore/Trackable');
import util = require('app/util');
import User = require('app/auth/User');

var app:WebApplication;
var connectionList:GroupedConnectionList;

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
		},
		apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT'
	});

	return app.run().then(function () {
		return (<User> (<any> app).get('user')).login({ username: 'test', password: 'test' }).then(() => {
			Connection.setDefaultApp(app);
			Connection.setDefaultStore(new ConnectionStore({ app: app }));
			// fetch and remove first to get rid of mock data that is inserted upon the fetch.
			// because this is a RequestMemory it will not try to fetch again.
			return util.removeAll(Connection.store).then(() => {
				connectionList =
					new GroupedConnectionList(lang.mixin(<HashMap<any>>{ app: app, collection: Connection.store }, kwArgs));
				app.get('ui').set('view', connectionList);
			});
		});
	});
}

function createConnection(kwArgs?:HashMap<any>) {
	return new Connection(lang.mixin(<HashMap<any>>{}, {
		app: app,
		id: 1,
		account: 'bob@smith.com',
		name: 'Bob Smith',
		itemName: 'Bob Smith (bob@smith.com)',
		type: 'E'
	}, kwArgs));
}

function testSearch(search:string):void {
	connectionList.set('search', search);
	eTypeAdapter.forEachConnectionType(function (connectionType) {
		var listView = connectionList.get('listViews')[connectionType];
		return (<dstore.ISyncCollection<Connection>> listView.get('collection')).fetch().totalLength.then(function (total) {
			var rows = connectionList.get('firstNode').querySelectorAll('.connection-type-' + connectionType + ' .dgrid-row');
			assert.strictEqual(total, rows.length);
		});
	});
}

registerSuite({
	name: 'app/ui/ConnectionList',

	'get/set tests': {
		beforeEach() {
			return createApp();
		},

		afterEach() {
			app.destroy();
		},

		displayName() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			return Connection.store.add(createConnection()).then(function () {
				var identifierNode = <HTMLElement> connectionList.get('firstNode').querySelector('.identifier');
				assert.strictEqual(identifierNode.textContent.trim(), 'bob@smith.com',
						'Text in connection row should match what was set');
			});
		},

		emptyGroups() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			return Connection.store.add(createConnection()).then(function () {
				var node = connectionList.get('firstNode');
				assert.strictEqual(node.querySelectorAll('.group-container').length,
					node.querySelectorAll('.group-container.is-hidden').length + 1,
					'All but one group should be hidden (because there is only one item)');
			});
		}
	},

	'search and value tests': {
		beforeEach() {
			return createApp();
		},

		afterEach() {
			return util.removeAll(Connection.store).then(function () {
				app.destroy();
			});
		},

		'search, successful values'() {
			return Connection.store.add(createConnection()).then(function () {
				return testSearch('bob');
			});
		},

		'search, unsuccessful values'() {
			return Connection.store.add(createConnection()).then(function () {
				return testSearch('fred');
			});
		},

		'value setter, verify selection and state of select-all widgets'() {
			var connection1 = createConnection();

			var connection2 = createConnection({
				id: 2,
				account: 'john@doe.com',
				type: 'M'
			});

			var connection3 = createConnection({
				id: 3,
				account: 'bob@smith.com',
				type: 'M'
			});

			return Promise.all([
				Connection.store.add(connection1),
				Connection.store.add(connection2),
				Connection.store.add(connection3)
			]).then(function () {
				var node = connectionList.get('firstNode');
				var messages = (<any> app).get('i18n').get('messages');

				connectionList.set('value', [connection1, connection3]);
				assert.strictEqual(node.querySelectorAll('.ContactRow.selected').length, 2,
					'2 items should be selected');
				assert.strictEqual(node.querySelector('.connection-type-facebook .select-all').textContent,
					messages.selectAll(),
					'The select-all widget for facebook connections should reflect that not all are selected');
				assert.strictEqual(node.querySelector('.connection-type-email .select-all').textContent,
					messages.selectNone(),
					'The select-all widget for email connections should reflect that all are selected');
			});
		}
	}
});
