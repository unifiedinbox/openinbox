var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/form/Button', '../connections/GroupedConnectionList', 'mayhem/Event', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util'], function (require, exports, Button, GroupedConnectionList, Event, SingleNodeWidget, util) {
    var MessageConnectionList = (function (_super) {
        __extends(MessageConnectionList, _super);
        function MessageConnectionList(kwArgs) {
            util.deferSetters(this, ['collection'], '_render');
            _super.call(this, kwArgs);
        }
        MessageConnectionList.prototype._collectionGetter = function () {
            return this._collection;
        };
        MessageConnectionList.prototype._collectionSetter = function (value) {
            if (value) {
                this._collection = value;
                this._connectionList.set('collection', value);
            }
        };
        MessageConnectionList.prototype._isAttachedGetter = function () {
            return this._isAttached;
        };
        MessageConnectionList.prototype._isAttachedSetter = function (value) {
            this._isAttached = value;
            this._connectionList.set('isAttached', value);
            this._submitButton.set('isAttached', value);
        };
        MessageConnectionList.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._connectionList.destroy();
            this._submitButton.destroy();
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        MessageConnectionList.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._bindingHandles = [];
        };
        MessageConnectionList.prototype._render = function () {
            var messages = this.get('app').get('i18n').get('messages');
            var button = new Button({
                app: this.get('app'),
                parent: this,
                label: messages.done()
            });
            var buttonContainer = document.createElement('div');
            this._node = document.createElement('div');
            this._connectionList = new GroupedConnectionList({
                app: this.get('app'),
                parent: this,
                showSearch: true
            });
            this._submitButton = button;
            this._node.appendChild(this._connectionList.detach());
            buttonContainer.classList.add('MessageFilters-dropDownActions');
            buttonContainer.appendChild(this._submitButton.detach());
            this._node.appendChild(buttonContainer);
            this._registerBindings();
            this._registerListeners();
        };
        MessageConnectionList.prototype._registerBindings = function () {
            var _this = this;
            var binder = this.get('app').get('binder');
            this._bindingHandles.push(binder.createBinding(this, 'parent.isOpen').observe(function (change) {
                if (!change.value) {
                    _this._connectionList.set('search', '');
                }
            }));
            this._bindingHandles.push(binder.createBinding(this._connectionList.get('value'), '*').observe(function (change) {
                var connections = _this._connectionList.get('value');
                connections.fetch().then(function (selected) {
                    _this.emit(new Event({
                        type: 'messageConnectionListChange',
                        bubbles: true,
                        cancelable: false,
                        target: selected.slice()
                    }));
                });
            }));
        };
        MessageConnectionList.prototype._registerListeners = function () {
            var _this = this;
            this._submitButton.on('activate', function (event) {
                _this.get('parent').set('isOpen', false);
                _this.emit(new Event({
                    type: 'messageConnectionListClosed',
                    bubbles: true,
                    cancelable: false,
                    target: _this
                }));
            });
        };
        return MessageConnectionList;
    })(SingleNodeWidget);
    return MessageConnectionList;
});
//# sourceMappingURL=MessageConnectionList.js.map