define(["require", "exports", 'intern/chai!assert', 'intern!object', '../../../ui/app', 'app/models/Comment', 'app/models/Contact', 'app/models/Message', 'app/models/adapters/getNotifications', 'app/models/stores/TrackableMemory'], function (require, exports, assert, registerSuite, app, Comment, Contact, Message, adapters, TrackableMemory) {
    Comment.setDefaultApp(app);
    Contact.setDefaultApp(app);
    Contact.setDefaultStore(new TrackableMemory());
    Message.setDefaultApp(app);
    Message.setDefaultStore(new TrackableMemory());
    registerSuite({
        name: 'app/models/adapters/getNotification',
        message: function () {
            return adapters.message({
                id: 123456,
                s: null,
                data: {
                    folderIndex: 5,
                    msgtype: 'a',
                    postdate: 'October 24 2014, 9:10',
                    userindx: 1
                }
            }).then(function (message) {
                var testTime = message.get('date').getTime();
                assert.equal(testTime, new Date('October 24 2014, 9:10').getTime());
                assert.equal(message.get('folderId'), 5);
                assert.equal(message.get('connectionType'), 'email');
                assert.equal(message.get('contactId'), 1);
            });
        },
        mention: function () {
            return Contact.store.put(new Contact({ id: 1 })).then(function () {
                return adapters.mention({
                    id: 234567,
                    s: null,
                    data: {
                        content: 'Lorem ipsum dolor sit amet',
                        noteIndx: 567,
                        postdate: 'October 24 2014, 9:10',
                        userindx: 1
                    }
                }).then(function (comment) {
                    var testTime = comment.get('date').getTime();
                    assert.equal(comment.get('id'), 567);
                    assert.equal(comment.get('contact').get('id'), 1);
                    assert.equal(testTime, new Date('October 24 2014, 9:10').getTime());
                    assert.equal(comment.get('message'), 'Lorem ipsum dolor sit amet');
                });
            });
        }
    });
});
//# sourceMappingURL=getNotifications.js.map