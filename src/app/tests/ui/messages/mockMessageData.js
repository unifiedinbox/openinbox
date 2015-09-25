define(["require", "exports", '../app', 'app/models/Attachment', 'app/models/Contact', 'dojo/_base/declare', 'app/models/Folder', 'app/models/Message', 'app/models/Notification', 'mayhem/Promise', 'app/models/stores/TrackableMemory'], function (require, exports, app, Attachment, Contact, declare, Folder, Message, Notification, Promise, TrackableMemory) {
    Attachment.setDefaultApp(app);
    Attachment.setDefaultStore(new TrackableMemory());
    Contact.setDefaultApp(app);
    Contact.setDefaultStore(new TrackableMemory());
    Folder.setDefaultApp(app);
    Folder.setDefaultStore(new TrackableMemory());
    Message.setDefaultApp(app);
    Message.setDefaultStore(new (declare(TrackableMemory, {
        moveToFolder: function (kwArgs) {
            var folderId = String(kwArgs.targetFolder);
            var messageIds = kwArgs.messageIds;
            console.log('The following messages have been moved to Folder ID #' + folderId + ': ' + messageIds.join(', '));
        },
        send: function (item) {
            return Promise.resolve(item);
        }
    }))());
    Notification.setDefaultApp(app);
    function folders(startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        var messages = app.get('i18n').get('messages');
        var folders = [
            { name: messages.inbox(), type: 'main', unreadMessageCount: 42 },
            { name: messages.drafts(), type: 'static' },
            { name: messages.outbox(), type: 'static' },
            { name: messages.sent(), type: 'static' },
            { name: messages.templates(), type: 'static' },
            { name: messages.junk(), type: 'static' },
            { name: messages.trash(), type: 'static', unreadMessageCount: 3 },
            { name: messages.archive(), type: 'static' },
            { name: 'Archive Child 1', type: 'personal', parentFolder: 'Archive' },
            { name: 'Archive Child 2', type: 'personal', parentFolder: 'Archive' },
            { name: 'Business', type: 'personal' },
            { name: 'Viva-Lite', type: 'shared' },
            { name: 'Private', type: 'personal' }
        ];
        return Promise.all(folders.map(function (data) {
            data.id = startIndex++;
            return Folder.store.put(new Folder(data));
        }));
    }
    exports.folders = folders;
    function attachments() {
        var attachments = [
            { name: 'holy-wicked-long-file-name-batman.png', type: 'image/png', size: '67890' },
            { name: 'never-gonna-give-you-up.mp3', type: 'audio/mpeg3', size: '2367890' },
            { name: 'uib.zip', type: 'application/zip', size: '12345' },
            { name: 'rick-roll-all-the-things.mov', type: 'video/quicktime', size: '1234567890' }
        ];
        return Promise.all(attachments.map(function (data) {
            return Attachment.store.put(new Attachment(data));
        }));
    }
    exports.attachments = attachments;
    function contacts(startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        var contacts = [
            { displayName: 'Bill Evans', email: 'bevans@riverside.com', image: 'BE' },
            { displayName: 'Miles Davis', email: 'mdavis@columbia.com', image: 'MD' },
            { displayName: 'John Coltrane', email: 'jcoltrane@bluenote.com', image: 'JC' }
        ];
        return Promise.all(contacts.map(function (data) {
            data.id = startIndex++;
            return Contact.store.put(new Contact(data));
        }));
    }
    exports.contacts = contacts;
    function messages(startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        var subject = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor vel sem eu consequat.';
        var messages = [
            {
                attachments: Attachment.store,
                commentCount: 1,
                connectionType: 'M',
                date: new Date(),
                forwarded: true,
                from: 'Bill Evans',
                privacyStatus: 'team',
                isStarred: true,
                subject: subject,
                to: ['Miles Davis', 'John Coltrane'],
            },
            {
                connectionType: 'A',
                date: new Date(2015, 2, 1),
                from: 'Miles Davis',
                privacyStatus: 'single',
                replied: true,
                subject: subject
            },
            {
                commentCount: 3,
                connectionType: 'E',
                date: new Date(2015, 2, 2),
                from: 'John Coltrane',
                isRead: true,
                privacyStatus: 'business',
                subject: subject,
                to: ['Bill Evans']
            },
            {
                date: new Date(),
                messageType: 'c',
                subject: 'I\'m a draft!',
                to: ['Scott LaFaro']
            },
            {
                connectionType: 'M',
                date: new Date(Date.now() * 1.03),
                folderId: 2,
                privacyStatus: 'public',
                subject: 'I\'m a scheduled message!',
                to: ['Scott LaFaro', 'Dave Brubeck']
            },
            {
                connectionType: 'A',
                date: new Date(2015, 2, 1),
                folderId: 3,
                privacyStatus: 'single',
                replied: true,
                subject: 'I\'m a sent message!',
                to: ['Scott LaFaro', 'Dave Brubeck']
            }
        ];
        return Promise.all(messages.map(function (data) {
            data.id = startIndex++;
            return Message.store.put(new Message(data));
        }));
    }
    exports.messages = messages;
    function notifications(startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        var subject = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc auctor vel sem eu consequat.';
        var notifications = [];
        for (var i = startIndex, l = startIndex + 9; i <= l; i += 1) {
            if (i < startIndex + 3) {
                notifications.push({
                    id: i,
                    type: 'message',
                    item: new Message({
                        commentCount: 3,
                        connectionType: 'E',
                        date: new Date(),
                        from: 'Oscar Peterson',
                        id: i,
                        privacyStatus: 'business',
                        subject: subject
                    })
                });
            }
            else if (i < startIndex + 6) {
                notifications.push({
                    id: i,
                    type: 'message',
                    item: new Message({
                        commentCount: 0,
                        connectionType: 'A',
                        date: new Date(),
                        from: 'Stéphane Grappelli',
                        id: i,
                        privacyStatus: 'public',
                        subject: subject
                    })
                });
            }
            else if (i < startIndex + 9) {
                notifications.push({
                    id: i,
                    type: 'message',
                    item: new Message({
                        commentCount: 0,
                        connectionType: 'M',
                        date: new Date(),
                        from: 'Django Reinhardt',
                        id: i,
                        privacyStatus: 'single',
                        subject: subject
                    })
                });
            }
            else {
                notifications.push({
                    id: i,
                    type: 'message',
                    item: new Message({
                        commentCount: 0,
                        connectionType: 'L',
                        date: new Date(),
                        from: 'Paul Motian',
                        id: i,
                        privacyStatus: 'business',
                        subject: subject
                    })
                });
            }
        }
        return Promise.all(notifications.map(function (data) {
            return Notification.store.put(new Notification(data));
        }));
    }
    exports.notifications = notifications;
});
//# sourceMappingURL=mockMessageData.js.map