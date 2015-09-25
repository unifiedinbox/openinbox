var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Event', 'dojo/_base/lang', 'mayhem/ui/dom/ListView', './MessageActions', '../../viewModels/MessageActions', '../../viewModels/MessageList', './MessageRow', '../../viewModels/SelectionManager', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util'], function (require, exports, Event, lang, ListView, MessageActions, MessageActionsViewModel, MessageProxy, MessageRow, SelectionManager, SingleNodeWidget, util) {
    var MessageList = (function (_super) {
        __extends(MessageList, _super);
        function MessageList(kwArgs) {
            util.deferSetters(this, ['collection'], '_render');
            _super.call(this, kwArgs);
        }
        MessageList.prototype._collectionGetter = function () {
            return this._collection;
        };
        MessageList.prototype._collectionSetter = function (value) {
            var self = this;
            if (this._collectionHandle) {
                this._collectionHandle.remove();
            }
            if (value) {
                var collection = this._selectionManager.wrapCollection(value);
                this._collection = MessageProxy.forCollection(collection).sort('date', true);
                this._resetMessageActions();
                this._listView.set('collection', this._collection);
                this._forceEmptyCheck();
                this._collectionHandle = this._collection.on('add, delete', function (event) {
                    var totalLength = self.get('totalLength');
                    if (event.type === 'add') {
                        self.set('totalLength', totalLength + 1);
                    }
                    else if (event.type === 'delete') {
                        self.set('totalLength', Math.max(0, totalLength - 1));
                    }
                });
            }
        };
        MessageList.prototype._currentFolderNameGetter = function () {
            return this._currentFolderName;
        };
        MessageList.prototype._currentFolderNameSetter = function (value) {
            this._currentFolderName = value;
            this._messageActions.get('model').set('currentFolderName', value);
        };
        MessageList.prototype._isAttachedSetter = function (value) {
            this._isAttached = value;
            this._listView.set('isAttached', value);
            this._messageActions.set('isAttached', value);
        };
        MessageList.prototype._isInSearchModeGetter = function () {
            return this._isInSearchMode;
        };
        MessageList.prototype._isInSearchModeSetter = function (value) {
            this._isInSearchMode = value;
            this._node.classList.toggle('is-inSearchMode', value);
        };
        MessageList.prototype._totalLengthGetter = function () {
            return this._totalLength;
        };
        MessageList.prototype._totalLengthSetter = function (value) {
            this._totalLength = value;
            this._emit(this._isInSearchMode ? 'searchFetchRange' : 'messageFetchRange');
        };
        MessageList.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._bindingHandles = [];
            this._selectionManager = new SelectionManager();
        };
        MessageList.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._listView.destroy();
            this._messageActions.destroy();
            this._collectionHandle && this._collectionHandle.remove();
            this._fetchRangeHandle && this._fetchRangeHandle.remove();
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        MessageList.prototype._render = function () {
            var app = this.get('app');
            this._node = document.createElement('div');
            this._node.className = 'MessageList dgrid-autoheight with-SelectableItem';
            this._listView = new ListView({
                app: app,
                itemConstructor: MessageRow,
                parent: this
            });
            this._node.appendChild(this._listView.detach());
            this._registerBindings();
            this._registerEvents();
        };
        MessageList.prototype._emit = function (type) {
            if (type) {
                this.emit(new Event({
                    type: type,
                    bubbles: true,
                    cancelable: false,
                    target: this
                }));
            }
        };
        MessageList.prototype._forceEmptyCheck = function () {
            var _this = this;
            this._collection.fetchRange({ start: 0, end: 1 }).totalLength.then(function (totalLength) {
                _this.set('totalLength', totalLength);
            });
        };
        MessageList.prototype._registerBindings = function () {
            var _this = this;
            var app = this.get('app');
            var binder = app.get('binder');
            this._bindingHandles.push(binder.createBinding(app, 'bulkMessageAction').observe(function (change) {
                var data = change.value;
                _this._selectionManager.get('selectedCollection').forEach(function (message) {
                    message.set(data.property, data.value);
                }).then(function () {
                    _this._selectionManager.reset();
                });
            }));
        };
        MessageList.prototype._registerEvents = function () {
            var _this = this;
            this._selectionManager.get('selectedCollection').on('add,delete', function (change) {
                var hasSelections = _this._selectionManager.get('hasSelections');
                _this._node.classList.toggle('is-inSelectionMode', hasSelections);
                _this.get('app').set('isMessageListInSelectionMode', hasSelections);
            });
            this.on('messageRowPointerEnter', function (event) {
                var row = event.target;
                var model = row.get('model');
                var messageActions = _this._messageActions;
                if (messageActions.get('parent') !== row) {
                    model.get('messageActionsData').then(function (options) {
                        messageActions.get('model').set(lang.mixin({ isOpen: true, message: model }, options));
                    });
                    messageActions.set('parent', row);
                    row.set('messageActions', messageActions);
                }
                else {
                    _this._pointerTimer && _this._pointerTimer.remove();
                }
            });
            this.on('messageRowPointerLeave', function (event) {
                var messageActions = _this._messageActions;
                if (!messageActions.get('hasOpenDropDown')) {
                    messageActions.reset(true);
                }
                else {
                    _this._pointerTimer = util.createTimer(function () {
                        messageActions.set('hasOpenDropDown', false);
                        messageActions.reset(true);
                    }, 100);
                }
            });
        };
        MessageList.prototype._resetMessageActions = function () {
            var app = this.get('app');
            this._messageActions && this._messageActions.destroy();
            this._messageActions = new MessageActions({
                app: app,
                model: new MessageActionsViewModel({
                    app: app,
                    currentFolderName: this.get('currentFolderName')
                })
            });
        };
        return MessageList;
    })(SingleNodeWidget);
    return MessageList;
});
//# sourceMappingURL=MessageList.js.map