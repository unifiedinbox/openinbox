define(["require", "exports", '../ui/AlertList', 'dojo/_base/lang', '../models/Message', '../ui/MessageComposition', '../viewModels/MessageComposition', '../models/RecentlyUsedFolder', '../util', "mayhem/templating/html!app/views/Inbox.html"], function (require, exports, AlertList, lang, Message, MessageComposition, MessageCompositionProxy, RecentlyUsedFolder, util) {
    var Inbox = require('mayhem/templating/html!app/views/Inbox.html');
    Inbox.prototype._bindingHandles = null;
    Inbox.prototype._composerHandle = null;
    var destroy = Inbox.prototype.destroy;
    Inbox.prototype.destroy = function () {
        destroy.call(this);
        this._alertList = null;
        this._composerHandle && this._composerHandle.remove();
        this._bindingHandles.forEach(function (handle) {
            handle.remove();
        });
    };
    var _initialize = Inbox.prototype._initialize;
    Inbox.prototype._initialize = function () {
        _initialize.call(this);
        this._bindingHandles = [];
    };
    var _render = Inbox.prototype._render;
    Inbox.prototype._render = function () {
        _render.call(this);
        this._registerBindings();
        this._registerEvents();
    };
    Inbox.prototype.compose = function () {
        this.get('model').set('isInCompositionMode', true);
    };
    Inbox.prototype.toggleSidebar = function () {
        var model = this.get('model');
        model.set('isSidebarVisible', !model.get('isSidebarVisible'));
    };
    Inbox.prototype.toggleActions = function () {
        var model = this.get('model');
        model.set('isActionsVisible', !model.get('isActionsVisible'));
    };
    Inbox.prototype._closeComposer = function (event) {
        var eventModel = event && event.target.get('model');
        if (eventModel && eventModel.get('draftSaveOnClose')) {
            Message.store.saveAsDraft(event.message, eventModel.get('compositionAction'));
        }
        this.set('composer', null);
        this.get('model').set('isInCompositionMode', false);
        this._composerHandle.remove();
    };
    Inbox.prototype._openComposer = function () {
        var _this = this;
        var app = this.get('app');
        var model = this.get('model');
        var message = model.get('compositionMessage');
        if (!message) {
            message = new Message({ app: app });
            message.set('scenario', 'new');
        }
        var composerModel = new MessageCompositionProxy({
            target: message,
            source: model.get('compositionMessageSource'),
            compositionAction: model.get('compositionAction')
        });
        var composer = new MessageComposition({
            app: app,
            model: composerModel
        });
        this.set('composer', composer);
        this._composerHandle = app.get('binder').createBinding(composerModel, 'isOpen').observe(function (change) {
            if (!change.value) {
                _this._closeComposer();
            }
        });
    };
    Inbox.prototype._registerBindings = function () {
        var binder = this.get('app').get('binder');
        var self = this;
        this._bindingHandles.push(binder.createBinding(this.get('model'), 'isInCompositionMode').observe(function (change) {
            var method = change.value ? '_openComposer' : '_closeComposer';
            self[method]();
        }));
    };
    Inbox.prototype._registerEvents = function () {
        this.on('folderSelected', function (event) {
            var folderRow = event.target;
            this.get('app').get('router').go('inbox', { folderId: folderRow.get('model').get('id') });
        });
        this._registerMessageEvents();
        this._registerMessageFilterEvents();
        this._registerSearchEvents();
    };
    Inbox.prototype._registerMessageEvents = function () {
        var _this = this;
        this.on('messageSelected', function (event) {
            var message = util.getProxyTarget(event.target.get('model'));
            _this.get('model').set({
                message: message,
                showConversation: true
            });
        });
        this.on('messageCompositionClose', this._closeComposer.bind(this));
        this.on('messageCompose', function (event) {
            var message = event.message;
            if (!event.message && event.source) {
                message = (event.action === 'forward') ? Message.getForwardMessage(event.source) : Message.getReplyMessage(event.source, Message.ReplyType[event.action]);
            }
            if (message) {
                _this.get('model').set({
                    compositionAction: event.action,
                    compositionMessage: message,
                    compositionMessageSource: event.source
                });
            }
        });
        this.on('messageRowFolderChange', function (event) {
            var message = event.target.get('model');
            var recentlyUsedFolders = _this.get('app').get('user').get('session').get('recentlyUsedFolders');
            recentlyUsedFolders.put(new RecentlyUsedFolder({
                id: message.get('folderId'),
                lastUsedDate: Date.now()
            }));
        });
        this.on('messageSend', function (event) {
            if (!_this._alertList) {
                _this._setAlertList();
            }
            var messages = _this.get('app').get('i18n').get('messages');
            _this._alertList && _this._alertList.add({
                message: messages.messageSent(),
                command: {
                    commit: function () {
                        Message.store.send(event.message);
                    }
                }
            });
            if (_this.get('model').get('isInCompositionMode')) {
                _this._closeComposer();
            }
        });
    };
    Inbox.prototype._registerMessageFilterEvents = function () {
        var _this = this;
        this.on('messageFilterSelect', function (event) {
            _this.get('model').set('messageFilter', event.target.get('model').get('selectedFilter'));
        });
        this.on('messageSearchFilterSelect', function (event) {
            _this.get('model').set('messageSearchFilter', event.target.get('model').get('selectedSearchFilter'));
        });
        this.on('messageSortSelect', function (event) {
            _this.get('model').set('messageSort', event.target.get('model').get('selectedSort'));
        });
        this.on('messageFilterConnectionsSelect', function (event) {
            _this.get('model').set('messageConnectionsFilter', event.target.get('model').get('selectedConnections'));
        });
    };
    Inbox.prototype._registerSearchEvents = function () {
        var _this = this;
        this.on('messageFetchRange', lang.hitch(this, '_updateMessageCount', 'messageCount'));
        this.on('searchFetchRange', lang.hitch(this, '_updateMessageCount', 'searchResultCount'));
        this.on('masterSearchFocus', function (event) {
            _this.get('model').set('masterSearchIsFocused', event.target.get('isFocused'));
        });
        this.on('masterSearchChange', function (event) {
            _this.get('model').set('masterSearchValue', event.target.get('search'));
        });
        this.on('masterSearchSubmit', function (event) {
            _this.get('model').set('masterSearchSubmitValue', event.target.get('search'));
        });
        this.on('searchResultSelected', function (event) {
            _this.get('model').set('masterSearchSubmitValue', event.item);
        });
    };
    Inbox.prototype._setAlertList = function () {
        var children = this._children;
        for (var i = children.length; i--;) {
            if (children[i] instanceof AlertList) {
                this._alertList = children[i];
                break;
            }
        }
    };
    Inbox.prototype._updateMessageCount = function (property, event) {
        var model = this.get('model');
        if (property) {
            this.get('model').set('isFetching', false);
            model.set(property, event.target.get('totalLength'));
        }
    };
    return Inbox;
});
//# sourceMappingURL=Inbox.js.map