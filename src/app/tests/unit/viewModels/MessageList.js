define(["require", "exports", 'intern/chai!assert', 'intern!object', 'mayhem/WebApplication', 'app/models/Attachment', 'app/models/Contact', 'app/models/Folder', 'app/models/Message', 'app/viewModels/MessageList', 'mayhem/Observable', 'mayhem/Promise', 'app/models/stores/TrackableMemory', '../../support/scenarios/Message'], function (require, exports, assert, registerSuite, WebApplication, Attachment, Contact, Folder, Message, MessageProxy, Observable, Promise, TrackableMemory, MessageScenarios) {
    MessageScenarios;
    var app;
    var message;
    registerSuite({
        name: 'app/viewModels/MessageList',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        rowType: {
            none: function () {
                return message.get('rowType').then(function (type) {
                    assert.equal(type, 'none');
                });
            },
            draft: function () {
                message.set('messageType', 'c');
                return message.get('rowType').then(function (type) {
                    assert.equal(type, 'draft');
                });
            },
            sent: function () {
                var promises = [];
                message.set('folderId', 1);
                promises.push(message.get('rowType').then(function (type) {
                    assert.equal(type, 'sent');
                }));
                message.set('folderId', 2);
                promises.push(message.get('rowType').then(function (type) {
                    assert.equal(type, 'sent');
                }));
                return Promise.all(promises);
            }
        },
        contacts: {
            typeNone: function () {
                var promises = [];
                promises.push(testParticipants('BE', 'Bill Evans'));
                message.set('to', ['Miles Davis']);
                promises.push(testParticipants('BE', 'Bill, Miles'));
                message.set('to', ['Miles Davis', 'John Coltrane']);
                promises.push(testParticipants('BE', 'Bill Evans', 2));
                message.set('from', 'cadderley');
                message.set('to', ['cadderley']);
                promises.push(testParticipants('', 'cadderley, cadderley'));
                return Promise.all(promises);
            },
            typeDraft: function () {
                message.set('messageType', 'c');
                return testParticipants('PM', null, null, 'Draft');
            },
            typeSent: function () {
                var promises = [];
                message.set('to', ['Scott LaFaro']);
                message.set('folderId', 1);
                promises.push(testParticipants('PM', 'Scott LaFaro'));
                message.set('to', ['Scott LaFaro', 'Dave Brubeck']);
                promises.push(testParticipants('PM', 'Scott LaFaro, Dave Brubeck'));
                return Promise.all(promises);
            }
        },
        dates: {
            isScheduled: function () {
                assert.isFalse(message.get('isScheduled'));
                message.set('date', new Date(Date.now() * 1.03));
                assert.isTrue(message.get('isScheduled'));
            },
            dateLabel: function () {
                var i18n = app.get('i18n');
                var format = {
                    datePattern: 'MMM d',
                    timePattern: 'h:mma'
                };
                assert.equal(message.get('dateLabel'), i18n.formatDate(message.get('date'), format));
                format.datePattern = 'yyyy MMM d';
                message.set('date', new Date(Date.now() * 1.03));
                assert.equal(message.get('dateLabel'), i18n.formatDate(message.get('date'), format));
            },
            smartDate: function () {
                var now = Date.now();
                var date;
                assert.equal(message.get('smartDate'), '0m');
                message.set('date', new Date(now - 120000));
                assert.equal(message.get('smartDate'), '2m');
                message.set('date', new Date(now - 7200000));
                assert.equal(message.get('smartDate'), '2h');
                message.set('date', new Date(now - (6 * 86400000)));
                assert.equal(message.get('smartDate'), '6d');
                date = new Date(now - (7 * 86400000));
                message.set('date', date);
                assert.equal(message.get('smartDate'), date.toLocaleDateString());
            },
        },
        cssClassGetters: {
            privacyIconClass: function () {
                assert.equal(message.get('privacyIconClass'), 'MessageRow-privacy--team');
                message.set('commentCount', 5);
                assert.sameMembers(message.get('privacyIconClass').split(' '), ['MessageRow-privacy--team', 'has-comments']);
                message.set('commentCount', 0);
                message.set('privacyStatus', 'business');
                assert.equal(message.get('privacyIconClass'), 'MessageRow-privacy--business');
            },
            stateClasses: function () {
                var classes = ['is-read', 'is-selected'];
                assert.equal(message.get('stateClasses'), 'is-unread');
                message.set('isRead', true);
                assert.equal(message.get('stateClasses'), 'is-read');
                message.set('isSelected', true);
                assert.sameMembers(message.get('stateClasses').split(' '), classes);
                message.set('isStarred', true);
                classes.push('is-starred');
                assert.sameMembers(message.get('stateClasses').split(' '), classes);
                message.set('forwarded', true);
                classes.push('is-forwarded');
                assert.sameMembers(message.get('stateClasses').split(' '), classes);
                message.set('replied', true);
                classes.push('is-replied');
                assert.sameMembers(message.get('stateClasses').split(' '), classes);
            }
        }
    });
    function testHasAttachments(expected) {
        if (expected === void 0) { expected = false; }
        return message.get('hasAttachments').then(function (value) {
            assert.equal(value, expected);
        });
    }
    function testParticipants(image, text, participantCount, label) {
        if (participantCount === void 0) { participantCount = 0; }
        if (label === void 0) { label = ''; }
        return message.get('contacts').then(function (data) {
            assert.equal(data.image, image);
            assert.equal(data.text, text);
            assert.equal(data.participantCount, participantCount);
            if (label) {
                assert.equal(data.label, label);
            }
        });
    }
    function createApp(kwArgs) {
        app = new WebApplication({
            name: 'Test',
            components: {
                i18n: { preload: ['app/nls/main'] },
                router: null,
                ui: { view: null }
            }
        });
        Attachment.setDefaultApp(app);
        Attachment.setDefaultStore(new TrackableMemory());
        Contact.setDefaultApp(app);
        Contact.setDefaultStore(new TrackableMemory());
        Folder.setDefaultApp(app);
        Folder.setDefaultStore(new TrackableMemory());
        Message.setDefaultApp(app);
        Message.setDefaultStore(new TrackableMemory());
        return app.run().then(function () {
            return setData();
        });
    }
    function setData() {
        var user = new Observable();
        user.set('data', new Observable({
            fullName: 'Paul Motian',
            image: 'PM'
        }));
        app.set('user', user);
        var contacts = [
            { id: 0, displayName: 'Bill Evans', email: 'bevans@riverside.com', image: 'BE' },
            { id: 1, displayName: 'Miles Davis', email: 'mdavis@columbia.com', image: 'MD' },
            { id: 2, displayName: 'John Coltrane', email: 'jcoltrane@bluenote.com', image: 'JC' },
            { id: 3, displayName: 'cadderley', email: 'cadderley@prestige.com' }
        ];
        var folders = [
            { id: 0, name: 'Inbox' },
            { id: 1, name: 'Sent' },
            { id: 2, name: 'Outbox' }
        ];
        var promises = contacts.map(function (data) {
            return Contact.store.put(new Contact(data));
        });
        promises.concat(folders.map(function (data) {
            return Folder.store.put(new Folder(data));
        }));
        return Promise.all(promises).then(function () {
            return Message.store.put(new Message({
                id: 0,
                folderId: 0,
                subject: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor vel sem eu consequat.',
                date: new Date(),
                from: 'Bill Evans',
                privacyStatus: 'team'
            })).then(function (item) {
                message = new MessageProxy({ target: item });
            });
        });
    }
});
//# sourceMappingURL=MessageList.js.map