import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Folder = require('app/models/Folder');
import FolderProxy = require('app/viewModels/FolderList');
import FolderRow = require('app/ui/folders/FolderRow');
import has = require('app/has');
import WebApplication = require('mayhem/WebApplication');

var app:WebApplication;
var folder:FolderProxy;
var folderRow:FolderRow;

registerSuite({
	name: 'app/ui/folders/FolderRow',

	beforeEach():IPromise<void> {
		return createApp();
	},

	afterEach():void {
		app.destroy();
	},

	'initialization': {
		'message count'() {
			var countNode = (<any> folderRow.get('firstNode')).querySelector('.Folder-unreadCount');

			assert.isTrue(countNode.classList.contains('is-hidden'),
				'The unread count node should be hidden when count is zero');
		}
	},

	'data binding': {
		'message count'() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var countNode = (<any> folderRow.get('firstNode')).querySelector('.Folder-unreadCount');
			var expectedCount = 30;
			var count:number;

			folder.set('unreadMessageCount', expectedCount);
			count = Number(countNode.firstChild.nodeValue);

			assert.equal(count, expectedCount, 'Displayed unread message count');
			assert.isFalse(countNode.classList.contains('is-hidden'),
				'The unread count node should be displayed when count is greater than zero');

			folder.set('unreadMessageCount', 0);
			count = Number(countNode.firstChild.nodeValue);

			assert.equal(count, 0, 'Displayed unread message count');
			assert.isTrue(countNode.classList.contains('is-hidden'),
				'The unread count node should be hidden when count is zero');
		},

		'current folder'() {
			if (!has('host-browser')) {
				this.skip('requires browser');
			}

			var folderNode = <HTMLElement> folderRow.get('firstNode');

			folder.set('isHighlighted', true);
			assert.include(folderNode.className, 'is-highlighted', 'Folder node class name');

			folder.set('isHighlighted', false);
			assert.notInclude(folderNode.className, 'is-highlighted', 'Folder node class name');
		}
	}
});

function createApp():IPromise<void> {
	app = new WebApplication({
		name: 'Folder List Test',
		components: {
			router: null,
			ui: {
				view: null
			}
		}
	});

	// Reset the default app on all models to the new `app` above to avoid `undefinedModule` errors.
	Folder.setDefaultApp(app);

	return app.run().then(function () {
		folder = new FolderProxy({
			app: app,
			target: new Folder({
				id: 10,
				name: 'Multi-word Folder Name'
			})
		});

		folderRow = new FolderRow({
			app: app,
			model: folder
		});

		app.get('ui').set('view', folderRow);
	});
}
