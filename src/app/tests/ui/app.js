define(["require", "exports", 'mayhem/WebApplication', 'app/models/Attachment', 'app/models/stores/Attachment', 'app/models/Connection', 'app/models/stores/Connection', 'app/models/Contact', 'app/models/stores/Contact', 'app/models/Conversation', 'app/models/stores/Conversation', 'app/models/Folder', 'app/models/stores/Folder', 'app/models/Message', 'app/models/stores/Message'], function (require, exports, WebApplication, Attachment, AttachmentStore, Connection, ConnectionStore, Contact, ContactStore, Conversation, ConversationStore, Folder, FolderStore, Message, MessageStore) {
    AttachmentStore;
    ConnectionStore;
    ContactStore;
    ConversationStore;
    FolderStore;
    MessageStore;
    var app = new WebApplication({
        name: 'Test',
        apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT',
        components: {
            i18n: { preload: ['app/nls/main'] },
            router: null,
            ui: {
                view: null
            },
            user: {
                constructor: 'app/auth/User'
            }
        }
    });
    Attachment.setDefaultApp(app);
    Attachment.store.app = app;
    Connection.setDefaultApp(app);
    Connection.store.app = app;
    Contact.setDefaultApp(app);
    Contact.store.app = app;
    Conversation.setDefaultApp(app);
    Conversation.store.app = app;
    Folder.setDefaultApp(app);
    Folder.store.app = app;
    Message.setDefaultApp(app);
    Message.store.app = app;
    return app;
});
//# sourceMappingURL=app.js.map