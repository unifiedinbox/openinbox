import assert = require('intern/chai!assert');
import Folder = require('app/models/Folder');
import FolderStore = require('app/models/stores/Folder'); FolderStore;
import foldersMock = require('../../../mocks/getAllFolders'); foldersMock;
import registerSuite = require('intern!object');
import User = require('app/auth/User');
import Promise = require('mayhem/Promise');
import WebApplication = require('mayhem/WebApplication');

var TEST_DATA_FOLDER_COUNT = 13;
var ARCHIVE_CHILD_COUNT = 4;
var STATIC_FOLDER_COUNT = 9;

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
			Folder.setDefaultApp(app);
			Folder.setDefaultStore(new FolderStore({ app: app }));
		});
	});
}

registerSuite({
	name: 'app/models/stores/Folder',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	'fetch'():IPromise<void> {
		return Folder.store.fetch().then(function (results) {
			assert.strictEqual(results.length, TEST_DATA_FOLDER_COUNT, 'Number of results');
		});
	},

	'filter'():IPromise<void[]> {
		return Promise.all([
			Folder.store.filter({ parentFolder: 'Archive' }).fetch().then(function (results) {
				assert.strictEqual(results.length, ARCHIVE_CHILD_COUNT, 'Number of children of "Archive"');
			}),
			Folder.store.filter({ type: 'staticFolder' }).fetch().then(function (results) {
				assert.strictEqual(results.length, STATIC_FOLDER_COUNT, 'Number of folders with type "staticFolder"');
			})
		]);
	},

	'totalLength'():IPromise<void> {
		return Folder.store.fetch().totalLength.then((val:number) => {
			assert.strictEqual(val, TEST_DATA_FOLDER_COUNT, 'totalLength of results');
		});
	}
});
