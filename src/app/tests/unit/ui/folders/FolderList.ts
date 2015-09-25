import lang = require('dojo/_base/lang');
import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import WebApplication = require('mayhem/WebApplication');
import Message = require('app/models/Message');
import Folder = require('app/models/Folder');
import FolderStore = require('app/models/stores/Folder'); FolderStore;
import RecentlyUsedFolder = require('app/models/RecentlyUsedFolder');
import FolderList = require('app/ui/folders/FolderList');
import TrackableMemory = require('app/models/stores/TrackableMemory');
import util = require('app/util');

var app:WebApplication;
var folderList:FolderList;
var excluded:string[] = [ 'Drafts', 'Outbox', 'Sent', 'Archive' ];
var recentlyUsedFolders = <any> new TrackableMemory();
var INBOX_ID = 5;

registerSuite({
	name: 'app/ui/folders/FolderList',

	'base tests': {
		beforeEach() {
			return createApp();
		},

		afterEach() {
			app.destroy();
		},

		mainList() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var links = folderList.get('firstNode').querySelectorAll('.Folder-link');
			Array.prototype.slice.call(links).forEach(function (node:HTMLElement) {
				var folderName = node.firstChild.nodeValue;
				assert.strictEqual(excluded.indexOf(folderName), -1,
					'Folder "' + folderName + '" should not be in the excluded array, since it appears in the list');
			});
		},

		classNames() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var folders:dstore.ICollection<Folder> = (<any> Folder.store).exclude(excluded, 'name');
			var node:HTMLElement = folderList.get('firstNode');

			assert.isTrue(node.classList.contains('wrapper'));

			return folders.forEach(function (folder:Folder):void {
				// Skip child folders since the FolderList widget has not been configured to render them
				if (folder.get('parentFolder')) {
					return;
				}
				var folderNode = <HTMLElement> node.querySelector('.Folder--' + util.toCamelCase(folder.get('name')));
				var type = folder.get('type');

				assert.isNotNull(folderNode);
				assert.isTrue(folderNode.classList.contains('Folder'));
				assert.isTrue(folderNode.classList.contains('Folder--' + type));
			});
		}
	},

	'options tests': {
		// Tests in this suite are each responsible for creating their own app/FolderList
		afterEach():void {
			app.destroy();
		},

		'unread counts': {
			off() {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				createApp({ showUnreadCount: false }).then(function ():void {
					var listNode = <HTMLElement> folderList.get('firstNode').querySelector('.FolderList');

					assert.isTrue(listNode.classList.contains('is-unreadCountHidden'));
				});
			},

			on() {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				return createApp().then(function ():IPromise<void> {
					return Folder.get(INBOX_ID).then(function (folder:Folder):IPromise<void> {
						var unreadCount = folder.get('unreadMessageCount') || 0;

						return Folder.updateUnreadCount(new Message({
							folderId: folder.get('id'),
							isRead: false
						})).then(function ():void {
							assert.equal(folder.get('unreadMessageCount'), unreadCount + 1);
						});
					});
				});
			}
		},

		search: {
			off() {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				return createApp().then(function ():void {
					var node = <HTMLElement> folderList.get('firstNode');

					assert.isNull(node.querySelector('.search-container'), 'Search component should not be displayed');
				});
			},

			on() {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				return createApp({ showSearch: true }).then(function ():void {
					var node = <HTMLElement> folderList.get('firstNode');

					assert.isNotNull(node.querySelector('.search-container'), 'Search component should be displayed');
				});
			}
		},

		'recently used folders': {
			off() {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				return createApp().then(function ():void {
					var node = <HTMLElement> folderList.get('firstNode');

					assert.isNull(node.querySelector('.FolderList--recentlyUsed'),
						'Recently used folders should not be displayed');
				});
			},

			on: {
				emptyCollection() {
					if (!has('host-browser')) {
						this.skip('requires browser');
					}

					return createApp({
						recentlyUsedFolders: recentlyUsedFolders,
						showRecentlyUsed: true
					}).then(function ():void {
						var node = <HTMLElement> folderList.get('firstNode');
						var listNode = <HTMLElement> node.querySelector('.FolderList--recentlyUsed');

						assert.isNotNull(listNode, 'Recently used folders should be displayed');
						assert.isTrue(listNode.classList.contains('is-empty'), 'Recently used folders should be empty');
					});
				},

				nonEmptyCollection() {
					if (!has('host-browser')) {
						this.skip('requires browser');
					}

					return createApp({
						showRecentlyUsed: true,
						recentlyUsedFolders: recentlyUsedFolders
					}).then(function ():IPromise<void> {
						return recentlyUsedFolders.put(new RecentlyUsedFolder({ id: INBOX_ID })).then(function ():void {
							folderList.set('recentlyUsedFolders', recentlyUsedFolders);

							var listNode = <HTMLElement> folderList.get('firstNode').querySelector('.FolderList--recentlyUsed');

							assert.isFalse(listNode.classList.contains('is-empty'),
								'Recently used folders should not be empty');
						});
					});
				}
			}
		},

		'archive folders': {
			off() {
				if (!has('host-browser')) {
					this.skip('requires browser');
				}

				return createApp().then(function ():void {
					var node = <HTMLElement> folderList.get('firstNode');

					assert.isNull(node.querySelector('.FolderList--archives'),
						'Archive folder should not be displayed');
				});
			},

			on: {
				emptyCollection() {
					if (!has('host-browser')) {
						this.skip('requires browser');
					}

					return createApp({ showArchives: true }).then(function ():void {
						var node = <HTMLElement> folderList.get('firstNode');
						var listNode = <HTMLElement> node.querySelector('.FolderList--archives');

						assert.isNotNull(listNode, 'Archive folder should be displayed');
						assert.isTrue(listNode.classList.contains('is-empty'), 'Archive folder should be empty');
					});
				},

				nonEmptyCollection() {
					if (!has('host-browser')) {
						this.skip('requires browser');
					}

					return createApp({ showArchives: true }, true).then(function ():void {
						var listNode = <HTMLElement> folderList.get('firstNode').querySelector('.FolderList--archives');

						assert.isFalse(listNode.classList.contains('is-empty'), 'Archive folder should not be empty');
					});
				}
			}
		}
	}
});

function createApp(kwArgs?:HashMap<any>, includeArchives:boolean = false):IPromise<void> {
	app = new WebApplication({
		name: 'Test',
		components: {
			i18n: { preload: [ 'app/nls/main' ] },
			router: null,
			ui: {
				view: null
			},
			user: {
				constructor: 'app/auth/User'
			}
		}
	});

	// Reset the default app on all models to the new `app` above to avoid `undefinedModule` errors.
	Folder.setDefaultApp(app);
	(<any> Folder.store).app = app;
	Message.setDefaultApp(app);
	RecentlyUsedFolder.setDefaultApp(app);

	if (!includeArchives) {
		Folder.store = Folder.store.filter(new (<any> Folder.store).Filter().ne('parentFolder', 'Archive'));
	}
	else {
		// In case the store was previously set to a filtered store, restore it
		Folder.store = (<any> Folder.store).root || Folder.store;
	}

	return app.run().then(function () {
		folderList = new FolderList(<any> lang.mixin({}, kwArgs, {
			app: app,
			collection: Folder.store,
			containerClass: 'wrapper',
			excluded: excluded
		}));
		app.get('ui').set('view', folderList);
	});
}
