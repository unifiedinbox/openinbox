import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import app = require('../../ui/app');
import Promise = require('mayhem/Promise');
import Message = require('app/models/Message');
import Folder = require('app/models/Folder');
import FolderStore = require('app/models/stores/Folder'); FolderStore;
import Memory = require('dstore/Memory');

// Force any models to use the test app as the default
Folder.setDefaultApp(app);
Message.setDefaultApp(app);

var defaultFolderStore = Folder.store;

var unreadMessageCount:number = 42;

registerSuite({
	name: 'app/models/Folder',

	before() {
		Folder.setDefaultStore(new Memory<Folder>());
	},

	after() {
		Folder.setDefaultStore(defaultFolderStore);
	},

	beforeEach() {
		resetData();
	},

	afterEach() {
		app.destroy();
	},

	'#get'():IPromise<void> {
		return Folder.get(0).then(function (folder:Folder):void {
			assert.equal(folder.get('name'), 'Inbox');
		});
	},

	'#updateUnreadCount'():IPromise<void> {
		return Folder.get(0).then(function (folder:Folder):void {
			var count:number = <any> folder.get('unreadMessageCount');
			folder.updateUnreadCount(true);

			assert.equal(folder.get('unreadMessageCount'), count - 1);

			folder.updateUnreadCount(false);
			assert.equal(folder.get('unreadMessageCount'), count);
		});
	},

	'.updateUnreadCount': {
		unread():IPromise<void> {
			var message = new Message({
				folderId: 0
			});

			return Folder.updateUnreadCount(message).then(function (folder:Folder):void {
				assert.equal(folder.get('unreadMessageCount'), unreadMessageCount + 1);
			});
		},

		'read': {
			'zero count'():IPromise<void> {
				var message = new Message({
					folderId: 0,
					isRead: true
				});

				return Folder.get(0).then(function (folder:Folder):IPromise<void> {
					folder.set('unreadMessageCount', 0);

					return Folder.updateUnreadCount(message).then(function (folder:Folder):void {
						assert.equal(folder.get('unreadMessageCount'), 0);
					});
				});
			},

			'non-zero count'():IPromise<void> {
				var message = new Message({
					folderId: 0,
					isRead: true
				});

				return Folder.updateUnreadCount(message).then(function (folder:Folder):void {
					assert.equal(folder.get('unreadMessageCount'), unreadMessageCount - 1);
				});
			}
		},

		'previous folder'():IPromise<void> {
			var message = new Message({
				folderId: 0
			});

			return Folder.updateUnreadCount(message).then(function (inbox:Folder):IPromise<void> {
				var count:number = <any> inbox.get('unreadMessageCount');
				message.set('folderId', 5);

				return Folder.updateUnreadCount(message, 0).then(function ():void {
					assert.equal(inbox.get('unreadMessageCount'), count - 1);
				});
			});
		}
	}
});

function resetData():void {
	(<Memory<any>> Folder.store).setData([
		{ id: 0, name: 'Inbox', unreadMessageCount: unreadMessageCount },
		{ id: 1, name: 'Drafts' },
		{ id: 2, name: 'Outbox', unreadMessageCount: 3 },
		{ id: 3, name: 'Sent' },
		{ id: 4, name: 'Templates' },
		{ id: 5, name: 'Junk' },
		{ id: 6, name: 'Trash' },
		{
			id: 7,
			name: 'Archive',
			children: [ 'Archive Child 1', 'Archive Child 2' ]
		},
		{ id: 8, name: 'Archive Child 1', type: 'personal' },
		{ id: 9, name: 'Archive Child 2', type: 'personal' },
		{ id: 10, name: 'Business', type: 'personal' },
		{ id: 11, name: 'Viva-Lite', type: 'shared' },
		{ id: 12, name: 'Private', type: 'personal' }
	]);
}
