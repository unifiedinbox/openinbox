var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../models/Conversation', 'dojo/_base/lang', 'mayhem/util', '../models/Message', 'mayhem/Observable', '../util'], function (require, exports, Conversation, lang, mayhemUtil, Message, Observable, util) {
    var sortByMap = {
        date: { column: 'date', order: 'DESC' },
        sender: { column: 'from', order: 'ASC' }
    };
    var Inbox = (function (_super) {
        __extends(Inbox, _super);
        function Inbox(kwArgs) {
            _super.call(this, kwArgs);
            this._registerBindings();
        }
        Inbox.prototype._compositionMessageGetter = function () {
            return this._compositionMessage;
        };
        Inbox.prototype._compositionMessageSetter = function (value) {
            this._compositionMessage = value;
            if (value) {
                this.set('isInCompositionMode', true);
            }
        };
        Inbox.prototype._folderGetter = function () {
            return this._folder;
        };
        Inbox.prototype._folderSetter = function (folder) {
            var current = this.get('folder');
            if (!current || folder.get('id') !== current.get('folderId')) {
                this.set('messages', Message.store.filter({
                    folderId: folder.get('id')
                }));
                this._messageActionsModel && this._messageActionsModel.set('currentFolderName', folder.get('name'));
                this._resetState();
            }
            this._folder = folder;
        };
        Inbox.prototype._isInCompositionModeGetter = function () {
            return this._isInCompositionMode;
        };
        Inbox.prototype._isInCompositionModeSetter = function (value) {
            this._isInCompositionMode = value;
            if (!value) {
                this.set('compositionMessage', null);
            }
        };
        Inbox.prototype._isInSearchModeDependencies = function () {
            return ['masterSearchIsFocused', 'masterSearchValue'];
        };
        Inbox.prototype._isInSearchModeGetter = function () {
            var isInSearchMode = this.get('masterSearchIsFocused') || Boolean(this.get('masterSearchValue'));
            this.get('app').set('isInSearchMode', isInSearchMode);
            return isInSearchMode;
        };
        Inbox.prototype._lastUpdatedDisplayDependencies = function () {
            return ['lastUpdated'];
        };
        Inbox.prototype._lastUpdatedDisplayGetter = function () {
            var messages = this.get('app').get('i18n').get('messages');
            this._lastUpdatedDisplay = util.formatSmartTime(this.get('lastUpdated'), messages);
            return this._lastUpdatedDisplay;
        };
        Inbox.prototype._masterSearchValueGetter = function () {
            return this._masterSearchValue;
        };
        Inbox.prototype._masterSearchValueSetter = function (value) {
            var _this = this;
            this._masterSearchValue = value;
            if (!value) {
                this.set('searchResultCount', null);
            }
            if (this.get('isInSearchMode')) {
                this._searchTimer && this._searchTimer.remove();
                this._searchTimer = mayhemUtil.createTimer(function () {
                    _this._searchMessages(value);
                }, 300);
            }
        };
        Inbox.prototype._masterSearchSubmitValueGetter = function () {
            return this._masterSearchSubmitValue;
        };
        Inbox.prototype._masterSearchSubmitValueSetter = function (value) {
            var searchType = (typeof value === 'string') ? 'all' : 'people';
            this._masterSearchSubmitValue = (typeof value === 'string') ? value : value.get('displayName');
            this._searchMessages(this._masterSearchSubmitValue, searchType);
        };
        Inbox.prototype._messageGetter = function () {
            return this._message;
        };
        Inbox.prototype._messageSetter = function (value) {
            this._message = value;
            if (value) {
                this.set('conversations', Conversation.store.filter({ messageId: value.get('id') }));
            }
        };
        Inbox.prototype._messagesGetter = function () {
            return this._messages;
        };
        Inbox.prototype._messagesSetter = function (value) {
            this._messages = value;
            this.set('isFetching', Boolean(this._stashedMessages));
            this.get('messageFiltersModel').set('messages', value);
        };
        Inbox.prototype._messageCountGetter = function () {
            return this._messageCount || 0;
        };
        Inbox.prototype._messageCountSetter = function (messageCount) {
            var self = this;
            this._messageCount = messageCount;
            this.set('lastUpdated', new Date());
            if (!this._lastUpdatedHandle) {
                var lastSyncTimer = setInterval(function () {
                    var messages = self.get('app').get('i18n').get('messages');
                    var oldValue = self._lastUpdatedDisplay;
                    var newValue = util.formatSmartTime(self.get('lastUpdated'), messages);
                    self._notify('lastUpdatedDisplay', newValue, oldValue);
                }, 60000);
                this._lastUpdatedHandle = mayhemUtil.createHandle(function () {
                    clearInterval(lastSyncTimer);
                });
            }
        };
        Inbox.prototype._messageCountDisplayDependencies = function () {
            return ['messageCount'];
        };
        Inbox.prototype._messageCountDisplayGetter = function () {
            var messageCount = this.get('messageCount');
            var messages = this.get('app').get('i18n').get('messages');
            return messages.messages({ NUM: messageCount });
        };
        Inbox.prototype._messageConnectionsFilterGetter = function () {
            return this._messageConnectionsFilter;
        };
        Inbox.prototype._messageConnectionsFilterSetter = function (value) {
            this._messageConnectionsFilter = value;
            if (!value || !value.length) {
                this.set('showNoResultsMessage', false);
                this.set('messages', this._stashedMessages);
                this._stashedMessages = null;
            }
            else {
                if (!this._stashedMessages) {
                    this._stashedMessages = this._messages;
                }
                var search = value.map(function (connection) {
                    return connection.get('displayName');
                }).join(',');
                this.set('messages', this._stashedMessages.search(search, 'from'));
            }
        };
        Inbox.prototype._messageFilterGetter = function () {
            return this._messageFilter;
        };
        Inbox.prototype._messageFilterSetter = function (standardFilter) {
            this._messageFilter = standardFilter;
            if (!standardFilter || (standardFilter === 'allMessages')) {
                this.set('showNoResultsMessage', false);
                this.set('messages', this._stashedMessages);
                this._stashedMessages = null;
            }
            else {
                if (!this._stashedMessages) {
                    this._stashedMessages = this._messages;
                }
                this.set('showNoResultsMessage', true);
                this.set('messages', this._stashedMessages.search(standardFilter, 'standardFilter'));
            }
        };
        Inbox.prototype._messageSearchFilterGetter = function () {
            return this._messageSearchFilter;
        };
        Inbox.prototype._messageSearchFilterSetter = function (value) {
            var filter = (!value || value === 'allResults') ? 'all' : value;
            this._messageSearchFilter = value;
            this.set('messages', this._stashedMessages.search(this._masterSearchValue, filter));
        };
        Inbox.prototype._messageSortGetter = function () {
            return this._messageSort;
        };
        Inbox.prototype._messageSortSetter = function (value) {
            var filter = sortByMap[value];
            this._messageSort = value;
            if (filter) {
                var kwArgs = { sortColumn: filter.column, sortOrder: filter.order };
                this.set('messages', this._messages.filter(kwArgs));
                if (this._stashedMessages) {
                    this._stashedMessages = this._stashedMessages.filter(kwArgs);
                }
            }
        };
        Inbox.prototype._stateClassesDependencies = function () {
            return ['isInCompositionMode', 'isInSearchMode'];
        };
        Inbox.prototype._stateClassesGetter = function () {
            var isInSearchMode = this.get('isInSearchMode');
            var isInCompositionMode = this.get('isInCompositionMode');
            var classes = (isInSearchMode || isInCompositionMode) ? 'has-overlay' : '';
            if (isInCompositionMode) {
                classes += ' is-inCompositionMode';
            }
            return classes;
        };
        Inbox.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._folder = null;
            this._message = null;
            this._compositionMessage = null;
            this._compositionMessageSource = null;
            this._searchTimer && this._searchTimer.remove();
            this._lastUpdatedHandle && this._lastUpdatedHandle.remove();
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        Inbox.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._bindingHandles = [];
            this._isActionsVisible = false;
            this._isFetching = false;
            this._isInboxZeroVisible = false;
            this._isInCompositionMode = false;
            this._isMessageListVisible = true;
            this._isSidebarVisible = false;
            this._lastUpdatedDisplay = '';
            this._messageCount = null;
            this._searchResultCount = null;
            this._showConversation = false;
        };
        Inbox.prototype._registerBindings = function () {
            var _this = this;
            var app = this.get('app');
            var binder = app.get('binder');
            this._bindingHandles = [];
            this._bindingHandles.push(binder.bind({
                source: app,
                sourcePath: 'isMessageListInSelectionMode',
                target: this,
                targetPath: 'isActionsVisible'
            }));
            this._bindingHandles.push(binder.createBinding(this, 'isInSearchMode').observe(function (change) {
                var messageFiltersModel = _this.get('messageFiltersModel');
                messageFiltersModel && messageFiltersModel.set('isInSearchMode', change.value);
                _this.set('showNoResultsMessage', change.value);
            }));
            [
                'isFetching',
                'masterSearchIsFocused',
                'messageCount',
                'searchResultCount'
            ].forEach(function (property) {
                _this._bindingHandles.push(binder.createBinding(_this, property).observe(lang.hitch(_this, '_setVisibility')));
            });
        };
        Inbox.prototype._resetState = function () {
            this.set({
                isInCompositionMode: false,
                masterSearchValue: '',
                showNoResultsMessage: false
            });
        };
        Inbox.prototype._searchMessages = function (search, type) {
            if (type === void 0) { type = 'people'; }
            if (!search) {
                this.set('messages', this._stashedMessages);
                this._stashedMessages = null;
            }
            else {
                if (!this._stashedMessages) {
                    this._stashedMessages = this._messages;
                }
                this.set('messages', this._stashedMessages.search(search, type));
            }
        };
        Inbox.prototype._setVisibility = function () {
            var filter = this.get('messageFilter');
            var count = this.get('isInSearchMode') ? this._searchResultCount : this._messageCount;
            var isMessageListVisible = this._isFetching || count || (filter && filter !== 'allMessages');
            var isInboxZeroVisible = !count && !this._isFetching;
            if (this.get('masterSearchIsFocused')) {
                if (!this.get('masterSearchValue')) {
                    isMessageListVisible = isInboxZeroVisible = false;
                }
                else if (this._isFetching) {
                    isMessageListVisible = true;
                    isInboxZeroVisible = false;
                }
            }
            this.set('isMessageListVisible', Boolean(isMessageListVisible));
            this.set('isInboxZeroVisible', isInboxZeroVisible);
        };
        return Inbox;
    })(Observable);
    return Inbox;
});
//# sourceMappingURL=Inbox.js.map