define(["require", "exports", 'dojo/on', '../../ui/app', 'app/models/Contact', 'app/models/Folder', 'app/models/Message', 'app/viewModels/MessageActions', 'app/models/stores/Message', 'mayhem/Observable', 'app/models/stores/TrackableMemory', '../../mocks/all', "dojo/dom-form", "mayhem/templating/html!./MessageListTestPageTemplate.html"], function (require, exports, on, app, Contact, Folder, Message, MessageActionsViewModel, MessageStore, Observable, TrackableMemory, mocks) {
    mocks;
    var domForm = require('dojo/dom-form');
    var View = require('mayhem/templating/html!./MessageListTestPageTemplate.html');
    var viewModel;
    Folder.setDefaultStore(new TrackableMemory({
        app: app,
        data: [
            new Folder({ app: app, id: 0, name: 'Drafts', type: 'static' }),
            new Folder({ app: app, id: 1, name: 'Outbox', type: 'static' }),
            new Folder({ app: app, id: 2, name: 'Sent', type: 'static' }),
            new Folder({ app: app, id: 3, name: 'Templates', type: 'static' }),
            new Folder({ app: app, id: 4, name: 'Junk', type: 'static' }),
            new Folder({ app: app, id: 5, name: 'Inbox', type: 'static' }),
            new Folder({ app: app, id: 6, name: 'Trash', type: 'static', unreadMessageCount: 3 }),
            new Folder({ app: app, id: 7, name: 'Archive', type: 'static' }),
            new Folder({ app: app, id: 8, name: 'Archive Child 1', type: 'personal', parentFolder: 'Archive' }),
            new Folder({ app: app, id: 9, name: 'Archive Child 2', type: 'personal', parentFolder: 'Archive' }),
            new Folder({ app: app, id: 10, name: 'Business', type: 'personal' }),
            new Folder({ app: app, id: 11, name: 'Viva-Lite', type: 'shared' }),
            new Folder({ app: app, id: 12, name: 'Private', type: 'personal' }),
            new Folder({ app: app, id: 162, name: 'Files', unreadMessageCount: 5 })
        ]
    }));
    Contact.setDefaultStore(new TrackableMemory({
        app: app
    }));
    Message.setDefaultApp(app);
    Message.setDefaultStore(new MessageStore({ app: app }));
    function renderView() {
        var user = app.get('user');
        user.set('folders', Folder.store);
        viewModel = new Observable({
            app: app,
            isMessageListVisible: true,
            isInboxZeroVisible: false,
            isInSearchMode: false,
            messages: Message.store,
            messageActionsModel: new MessageActionsViewModel({
                app: app,
                excludedFolders: ['Drafts', 'Outbox', 'Sent', 'Archive'],
                hideDistribute: true,
                hideMore: true,
                isOpen: true
            })
        });
        var view = new View({
            app: app,
            model: viewModel
        });
        app.get('ui').set('view', view);
        view.on('messageFetchRange', function (event) {
            var count = event.target.get('totalLength');
            viewModel.set('isMessageListVisible', Boolean(count));
            viewModel.set('isInboxZeroVisible', !count);
        });
        app.get('binder').createBinding(app, 'isMessageListInSelectionMode').observe(function (change) {
            view.get('model').set('isActionsVisible', change.value);
        });
        var isEmpty = false;
        on(document.getElementById('toggleInboxZero'), 'click', function () {
            if (isEmpty) {
                viewModel.set({
                    isInSearchMode: false,
                    isMessageListVisible: true,
                    isInboxZeroVisible: false
                });
            }
            else {
                viewModel.set({
                    isInSearchMode: false,
                    isMessageListVisible: false,
                    isInboxZeroVisible: true
                });
            }
            isEmpty = !isEmpty;
        });
        on(document.getElementById('toggleZeroResults'), 'click', function () {
            if (isEmpty) {
                viewModel.set({
                    isInSearchMode: false,
                    isMessageListVisible: true,
                    isInboxZeroVisible: false
                });
            }
            else {
                viewModel.set({
                    isInSearchMode: true,
                    isMessageListVisible: false,
                    isInboxZeroVisible: true
                });
            }
            isEmpty = !isEmpty;
        });
        var messageList = view.get('children')[1];
        messageList.on('messageSelected', function (event) {
            var message = event.target.get('model');
            console.log('messageSelected event triggered by message #' + String(message.get('id')) + ' from ' + message.get('from'));
        });
    }
    app.run().then(function () {
        var user = app.get('user');
        var sessionId = sessionStorage.getItem('uib-test-sessionId');
        var uibApplication = sessionStorage.getItem('uib-test-uibApplication');
        if (user && sessionId) {
            user.set('sessionId', sessionId);
            user.set('uibApplication', uibApplication);
            renderView();
        }
    });
    on(document.getElementById('login'), 'submit', function (event) {
        event.preventDefault();
        var value = domForm.toObject(this);
        var user = app.get('user');
        user.login({
            username: value.username,
            password: value.password
        }).then(function () {
            sessionStorage.setItem('uib-test-sessionId', user.get('sessionId'));
            sessionStorage.setItem('uib-test-uibApplication', user.get('uibApplication'));
            renderView();
        });
    });
    return app;
});
//# sourceMappingURL=MessageList.js.map