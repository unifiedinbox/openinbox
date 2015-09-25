define(["require", "exports", '../app', 'app/models/Folder', '../../mocks/Login', 'app/ui/messages/MessageActions', 'app/viewModels/MessageActions', 'app/models/RecentlyUsedFolder', 'app/models/stores/TrackableMemory'], function (require, exports, app, Folder, LoginServiceMock, MessageActions, MessageActionsViewModel, RecentlyUsedFolder, TrackableMemory) {
    LoginServiceMock;
    Folder.setDefaultApp(app);
    Folder.setDefaultStore(new TrackableMemory({ app: app }));
    RecentlyUsedFolder.setDefaultApp(app);
    app.run().then(function () {
        var user = app.get('user');
        user.login({
            username: 'test',
            password: 'pass'
        }).then(function () {
            var date = 0;
            var recentlyUsedFolders;
            var messages = app.get('i18n').get('messages');
            var folders = [
                { id: 0, name: messages.inbox(), type: 'main', unreadMessageCount: 42 },
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
            folders.forEach(function (folderData) {
                Folder.store.put(folderData);
            });
            user.set('folders', Folder.store);
            recentlyUsedFolders = user.get('session').get('recentlyUsedFolders');
            [12, 11, 10].forEach(function (id) {
                recentlyUsedFolders.put(new RecentlyUsedFolder({
                    id: id,
                    lastUsedDate: +new Date + ++date
                }));
            });
            app.get('ui').set('view', new MessageActions({
                app: app,
                model: new MessageActionsViewModel({
                    app: app,
                    excludedFolders: ['Drafts', 'Outbox', 'Sent', 'Archive'],
                    isOpen: true
                })
            }));
        });
    });
    return app;
});
//# sourceMappingURL=MessageActions.js.map