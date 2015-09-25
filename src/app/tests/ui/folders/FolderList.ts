import app = require('../app');
import Event = require('mayhem/Event');
import FolderList = require('app/ui/folders/FolderList');
import Folder = require('app/models/Folder');
import Message = require('app/models/Message');
import RecentlyUsedFolder = require('app/models/RecentlyUsedFolder');
import on = require('dojo/on');
import TrackableMemory = require('app/models/stores/TrackableMemory');

// comment out this line to disable service mocks
import mocks = require('../../mocks/all'); mocks;

// Force any models to use the test app as the default
Message.setDefaultApp(app);
Folder.setDefaultApp(app);
Folder.setDefaultStore(<any> new TrackableMemory());
RecentlyUsedFolder.setDefaultApp(app);

app.run().then(function () {
	var user = <any> app.get('user');
	user.login({
		username: 'test',
		password: 'pass'
	}).then(function () {
		user.set('folders', Folder.store);

		var messages = (<any> app.get('i18n')).get('messages');
		var folders = [
			{ id: 0, name: messages.inbox(), type: 'main', unreadMessageCount: 10 },
			{ id: 1, name: messages.drafts(), type: 'static' },
			{ id: 2, name: messages.outbox(), type: 'static', unreadMessageCount: 3 },
			{ id: 3, name: messages.sent(), type: 'static' },
			{ id: 4, name: messages.templates(), type: 'static' },
			{ id: 5, name: messages.junk(), type: 'static' },
			{ id: 6, name: messages.trash(), type: 'static' },
			{ id: 7, name: messages.archive(), type: 'static' },
			{ id: 8, name: 'Archive Child 1', type: 'personal', parentFolder: 'Archive' },
			{ id: 9, name: 'Archive Child 2', type: 'personal', parentFolder: 'Archive' },
			{ id: 10, name: 'Business', type: 'personal' },
			{ id: 11, name: 'Viva-Lite', type: 'shared' },
			{ id: 12, name: 'Private', type: 'personal' }
		];

		folders.forEach(function (folderData:any) {
			(<any> Folder.store).put(new Folder(folderData));
		});

		var date:number = 0;
		var recentlyUsedFolders:dstore.ICollection<RecentlyUsedFolder> = user.get('session').get('recentlyUsedFolders');

		// 'Private', 'Viva-Lite', 'Business'
		[ 12, 11, 10 ].forEach(function (id:number):void {
			recentlyUsedFolders.put(new RecentlyUsedFolder({
				id: id,
				lastUsedDate: +new Date + ++date
			}));
		});

		var folderList:FolderList = new FolderList({
			app: app,
			collection: user.get('folders'),
			recentlyUsedFolders: user.get('session').get('recentlyUsedFolders'),
			excluded: [ 'Drafts', 'Outbox', 'Sent', 'Archive' ],
			showSearch: true,
			showRecentlyUsed: true,
			showArchives: true
		});

		app.get('ui').set('view', folderList);

		app.get('ui').on('folderSelected', function (event:Event):void {
			var model:Folder = event.target.get('model');
			document.getElementById('value').textContent = model.get('name');

			folderList.get('collection').forEach(function (folder:Folder):void {
				var isHighlighted = (folder.get('id') === model.get('id'));
				folder.set('isHighlighted', isHighlighted);
			});
		});

		on(document.getElementById('addUnread'), 'click', function ():void {
			Folder.updateUnreadCount(new Message({
				folderId: 0,
				isRead: false
			}));
		});

		on(document.getElementById('markAsRead'), 'click', function ():void {
			Folder.updateUnreadCount(new Message({
				folderId: 0,
				isRead: true
			}));
		});

		on(document.getElementById('setMostRecent'), 'click', function ():void {
			var recents = user.get('session').get('recentlyUsedFolders');

			recents.put(new RecentlyUsedFolder({ id: 12 }));
			user.get('session').set('recentlyUsedFolders', recents.sort('lastUsedDate', true));

			folderList.set('recentlyUsedFolders', user.get('session').get('recentlyUsedFolders'));
		});
	});
});

export = app;
