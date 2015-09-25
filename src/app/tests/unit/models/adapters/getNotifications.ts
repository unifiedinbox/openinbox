import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import app = require('../../../ui/app');
import Comment = require('app/models/Comment');
import Contact = require('app/models/Contact');
import Message = require('app/models/Message');
import adapters = require('app/models/adapters/getNotifications');
import TrackableMemory = require('app/models/stores/TrackableMemory');

Comment.setDefaultApp(app);
Contact.setDefaultApp(app);
Contact.setDefaultStore(<any> new TrackableMemory());
Message.setDefaultApp(app);
Message.setDefaultStore(<any> new TrackableMemory());

registerSuite({
	name: 'app/models/adapters/getNotification',

	message():IPromise<void> {
		return adapters.message(<adapters.IMessageNotification> {
			id: 123456,
			s: null,
			data: {
				folderIndex: 5,
				msgtype: 'a',
				postdate: 'October 24 2014, 9:10',
				userindx: 1
			}
		}).then(function (message:Message):void {
			var testTime:number = (<any> message.get('date')).getTime();

			assert.equal(testTime, new Date('October 24 2014, 9:10').getTime());
			assert.equal(message.get('folderId'), 5);
			assert.equal(message.get('connectionType'), 'email');
			assert.equal(message.get('contactId'), 1);
		});
	},

	mention():IPromise<void> {
		return Contact.store.put(new Contact({ id: 1 })).then(function ():IPromise<void> {
			return adapters.mention(<adapters.IMentionNotification> {
				id: 234567,
				s: null,
				data: {
					content: 'Lorem ipsum dolor sit amet',
					noteIndx: 567,
					postdate: 'October 24 2014, 9:10',
					userindx: 1
				}
			}).then(function (comment:Comment):void {
				var testTime:number = (<any> comment.get('date')).getTime();

				assert.equal(comment.get('id'), 567);
				assert.equal(comment.get('contact').get('id'), 1);
				assert.equal(testTime, new Date('October 24 2014, 9:10').getTime());
				assert.equal(comment.get('message'), 'Lorem ipsum dolor sit amet');
			});
		});
	}
});
