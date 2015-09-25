var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../models/Alert', '../models/Contact', '../models/stores/Contact', '../models/Conversation', '../models/stores/Conversation', '../models/Comment', '../models/Folder', '../models/Message', '../viewModels/MessageActions', '../viewModels/MessageFilters', '../models/stores/Message', '../models/Notification', 'mayhem/Promise', 'mayhem/Observable', '../views/Inbox', '../viewModels/Inbox'], function (require, exports, Alert, Contact, ContactStore, Conversation, ConversationStore, Comment, Folder, Message, MessageActionsViewModel, MessageFiltersViewModel, MessageStore, Notification, Promise, Observable, View, ViewModel) {
    ContactStore;
    ConversationStore;
    var Route = (function (_super) {
        __extends(Route, _super);
        function Route() {
            _super.apply(this, arguments);
        }
        Route.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._view && this._view.destroy();
        };
        Route.prototype.enter = function (kwArgs) {
            var app = this.get('app');
            var user = app.get('user');
            if (!user.get('isAuthenticated')) {
                return app.get('router').go('login', { action: 'login' });
            }
            user.set('alerts', Alert.store);
            user.set('backgroundImage', require.toUrl('app/resources/images/background.jpg'));
            var unreadCount = 0;
            var message = 'Bacon ipsum dolor amet porchetta cow capicola pork belly \
		beef ribs short ribs ribeye shoulder swine tail. Strip steak cupim drumstick, \
		salami rump t-bone biltong jowl pork loin andouille porchetta fatback. Porchetta \
		picanha tenderloin bacon. Picanha sausage spare ribs meatloaf, sirloin pastrami \
		turducken hamburger. Alcatra drumstick short loin turkey andouille spare ribs \
		kevin pastrami sirloin tongue turducken.';
            var promises = [];
            while (unreadCount < 10) {
                promises.push(Contact.get(Math.floor(unreadCount / 2)).then(function (contact) {
                    return !contact ? null : Notification.store.put(new Notification({
                        id: unreadCount,
                        type: 'mention',
                        item: new Comment({
                            contact: contact,
                            message: message
                        })
                    }));
                }));
                unreadCount += 1;
            }
            var self = this;
            Promise.all(promises).then(function () {
                user.set('mentions', Notification.store.filter({ type: 'mention' }));
                user.set('conversations', Conversation.store);
                Message.setDefaultStore(new MessageStore({ app: app }));
                self._model = new ViewModel({
                    app: app,
                    messageActionsModel: new MessageActionsViewModel({
                        app: app,
                        excludedFolders: ['Drafts', 'Outbox', 'Sent', 'Archive'],
                        hideDistribute: true,
                        hideMore: true,
                        isOpen: true
                    }),
                    messageFiltersModel: new MessageFiltersViewModel({
                        app: app,
                        connections: user.get('connections')
                    })
                });
                Folder.get(kwArgs.folderId).then(function (folder) {
                    self._model.set({
                        folder: folder
                    });
                    self._view = new View({
                        app: app,
                        model: self._model
                    });
                    app.get('ui').set('view', self._view);
                });
            });
        };
        Route.prototype.exit = function () {
            this.get('app').get('ui').get('view').set('default', null);
        };
        Route.prototype.update = function (kwArgs) {
            var _this = this;
            Folder.get(kwArgs.folderId).then(function (folder) {
                _this.get('model').set('folder', folder);
            });
        };
        return Route;
    })(Observable);
    return Route;
});
//# sourceMappingURL=Inbox.js.map