var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './ContactList', 'mayhem/Event', 'mayhem/ui/dom/Label', '../../viewModels/SelectionManager', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util'], function (require, exports, ContactList, Event, Label, SelectionManager, SingleNodeWidget, util) {
    var SelectAction;
    (function (SelectAction) {
        SelectAction[SelectAction["All"] = 0] = "All";
        SelectAction[SelectAction["None"] = 1] = "None";
    })(SelectAction || (SelectAction = {}));
    var RecipientList = (function (_super) {
        __extends(RecipientList, _super);
        function RecipientList(kwArgs) {
            util.deferSetters(this, ['collection', 'message', 'initialRecipients'], '_render');
            _super.call(this, kwArgs);
        }
        RecipientList.prototype._collectionGetter = function () {
            return this._collection;
        };
        RecipientList.prototype._collectionSetter = function (collection) {
            var self = this;
            this._collection = collection;
            if (collection) {
                collection.fetch().then(function (data) {
                    self.set('collectionTotal', data.length);
                });
            }
            else {
                this.set('collectionTotal', 0);
            }
            this._contactList.set('collection', collection);
        };
        RecipientList.prototype._initialRecipientsGetter = function () {
            return this._initialRecipients;
        };
        RecipientList.prototype._initialRecipientsSetter = function (value) {
            this._initialRecipients = value;
            if (value && value.length) {
                this._contactList.set('value', value);
            }
        };
        RecipientList.prototype._isAttachedSetter = function (isAttached) {
            this._contactList && this._contactList.set('isAttached', isAttached);
            this._isAttached = isAttached;
        };
        RecipientList.prototype._valueGetter = function () {
            return this._contactList.get('value');
        };
        RecipientList.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._contactList && this._contactList.destroy();
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        RecipientList.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._bindingHandles = [];
        };
        RecipientList.prototype._render = function () {
            var app = this.get('app');
            this._node = document.createElement('div');
            this._node.className = 'RecipientList';
            this._selectAllLabel = new Label({
                app: app,
                parent: this
            });
            this._setSelectState(0 /* All */);
            this._selectAllNode = document.createElement('span');
            this._selectAllNode.classList.add('RecipientList_SelectAllNone');
            this._selectAllNode.appendChild(this._selectAllLabel.detach());
            this._contactList = new ContactList({
                app: app,
                parent: this,
                selectionMode: 1 /* multiple */
            });
            this._contactListNode = this._contactList.detach();
            this._node.appendChild(this._selectAllNode);
            this._node.appendChild(this._contactListNode);
            this.on('activate', this._setSelectAction.bind(this));
            this._registerBindings();
        };
        RecipientList.prototype._registerBindings = function () {
            var _this = this;
            var binder = this.get('app').get('binder');
            this._bindingHandles.push(binder.createBinding(this._contactList.get('value'), '*').observe(function (change) {
                _this.emit(new Event({
                    type: 'updateRecipients',
                    bubbles: true,
                    cancelable: false,
                    target: _this
                }));
            }));
        };
        RecipientList.prototype._setSelectAction = function (event) {
            var self = this;
            var label;
            var selectedRecipients = this._contactList.get('value');
            if (event.target instanceof Label) {
                label = event.target;
                if (label.get('action') === 0 /* All */) {
                    this._setIsSelected(true);
                    this._setSelectState(1 /* None */);
                }
                else {
                    this._setIsSelected(false);
                    this._setSelectState(0 /* All */);
                }
            }
            else {
                selectedRecipients.fetch().then(function (data) {
                    if (data.length < self.get('collectionTotal')) {
                        self._setSelectState(0 /* All */);
                    }
                    else {
                        self._setSelectState(1 /* None */);
                    }
                });
            }
        };
        RecipientList.prototype._setIsSelected = function (isSelected) {
            var self = this;
            if (!this._collection) {
                return;
            }
            if (isSelected) {
                this._collection.fetch().then(function (contacts) {
                    self._contactList.set('value', contacts);
                });
            }
            else {
                this._contactList.set('value', []);
            }
        };
        RecipientList.prototype._setSelectState = function (selectState) {
            if (selectState === 0 /* All */) {
                this._selectAllLabel.set({
                    text: this.get('app').get('i18n').get('messages').selectAllCamelCase(),
                    action: 0 /* All */
                });
            }
            else {
                this._selectAllLabel.set({
                    text: this.get('app').get('i18n').get('messages').selectNoneCamelCase(),
                    action: 1 /* None */
                });
            }
        };
        return RecipientList;
    })(SingleNodeWidget);
    return RecipientList;
});
//# sourceMappingURL=RecipientList.js.map