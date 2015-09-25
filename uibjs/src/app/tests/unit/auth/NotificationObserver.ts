import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import declare = require('dojo/_base/declare');
import lang = require('dojo/_base/lang');
import Memory = require('dstore/Memory');
import Trackable = require('dstore/Trackable');
import PersistentModel = require('mayhem/data/PersistentModel');
import app = require('../../ui/app');
import NotificationObserver = require('app/auth/NotificationObserver');
import Notification = require('app/models/Notification');

class TestModel extends PersistentModel {}
TestModel.setDefaultApp(app);
TestModel.setDefaultStore(new (<any> declare([ Memory, Trackable ]))());

Notification.setDefaultApp(app);

var observer:NotificationObserver;
var data:Notification[];

registerSuite({
	name: 'app/auth/NotificationObserver',

	'method tests': {
		beforeEach():void {
			observer = setData();
		},

		add():IPromise<void> {
			observer.add(data);

			assert.equal(observer.get('queue').length, 10,
				'New items should be added to a queue.');

			return TestModel.store.fetch().then(function (items:TestModel[]):void {
				assert.equal(items.length, 0,
					'New items should not be added to their store.');
			});
		},

		commit():IPromise<void> {
			observer.add(data);

			return observer.commit().then(function ():IPromise<void> {
				return TestModel.store.fetch().then(function (items:TestModel[]):void {
					assert.equal(items.length, 10,
						'Committed items should be added to their store.');
				});
			});
		}
	}
});

function setData(kwArgs?:HashMap<any>) {
	data = [];
	for (var i = 0; i < 10; i++) {
		data.push(new Notification({
			id: i,
			item: new TestModel({
				id: i,
				isRead: false,
				folderid: 0
			})
		}));
	}

	return new NotificationObserver(lang.mixin(<HashMap<any>> {}, kwArgs, {
		collection: TestModel.store
	}));
}
