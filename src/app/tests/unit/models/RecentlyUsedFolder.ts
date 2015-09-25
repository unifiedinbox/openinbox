import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import WebApplication = require('mayhem/WebApplication');
import endpoints = require('app/endpoints');
import Folder = require('app/models/Folder');
import FolderStore = require('app/models/stores/Folder'); FolderStore;
import folderData = require('../../mocks/data/getAllFolders');
import RecentlyUsedFolder = require('app/models/RecentlyUsedFolder');
import Memory = require('dstore/Memory');

var app:WebApplication;
var collection:dstore.ICollection<RecentlyUsedFolder>;

registerSuite({
	name: 'app/models/RecentlyUsedFolder',

	beforeEach() {
		return createApp();
	},

	afterEach() {
		app.destroy();
	},

	'.getFolders'() {
		return RecentlyUsedFolder.getFolders(collection).then(function (folders:dstore.ICollection<Folder>):IPromise<void> {
			return folders.fetch().then(function (folders:Folder[]):void {
				assert.sameMembers(folders.map((f:Folder) => f.get('name')), [ 'Inbox', 'Drafts'] );
				assert.isTrue(folders.every((f:Folder) => f instanceof Folder),
					'RecentlyUsedFolder.getFolders should return Folder models');
			});
		});
	}
});

function createApp():IPromise<void> {
	app = new WebApplication({
		name: 'Test',
		components: {
			user: {
				constructor: 'app/auth/user'
			},
			router: null,
			ui: {
				view: null
			}
		}
	});

	// Force any models to use the test app as the default
	Folder.setDefaultApp(app);
	(<any> Folder.store).app = app;
	RecentlyUsedFolder.setDefaultApp(app);

	return app.run().then(function () {
		collection = <any> createStore();
	});
}

function createStore():Memory<{}> {
	var recentsStore = new Memory();
	var recents:RecentlyUsedFolder[] = folderData.UNIFIED.filter(function (item) {
		return item.name === 'Inbox' || item.name === 'Drafts';
	}).map(function (item):RecentlyUsedFolder {
		return new RecentlyUsedFolder({ id: item.index });
	});

	recentsStore.setData(recents);

	return recentsStore;
}
