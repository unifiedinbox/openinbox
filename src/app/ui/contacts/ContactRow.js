var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget', '../Avatar', '../../models/adapters/eType', '../TooltipLabel'], function (require, exports, SingleNodeWidget, Avatar, eTypeAdapter, TooltipLabel) {
    var ContactRow = (function (_super) {
        __extends(ContactRow, _super);
        function ContactRow() {
            _super.apply(this, arguments);
        }
        ContactRow.prototype._isAttachedSetter = function (value) {
            this._avatar.set('isAttached', value);
            this._tooltipLabel.set('isAttached', value);
            this._isAttached = value;
        };
        ContactRow.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._bindingHandles = [];
        };
        ContactRow.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._avatar.destroy();
            this._tooltipLabel.destroy();
            this.set('model', undefined);
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        ContactRow.prototype._renderIdentifierNode = function () {
            this._tooltipLabel = new TooltipLabel({
                app: this.get('app'),
                text: this._model.get('displayName'),
                parent: this
            });
            var spanNode = this._tooltipLabel.detach();
            spanNode.classList.add('identifier');
            return spanNode;
        };
        ContactRow.prototype._renderConnectionTypesNode = function () {
            var contact = this._model;
            var connectionTypesNode = document.createElement('span');
            if (contact.get('connectionTypes')) {
                connectionTypesNode.classList.add('connection-types');
                contact.get('connectionTypes').forEach(function (connectionType) {
                    var connectionTypeNode = document.createElement('span');
                    connectionTypeNode.classList.add('connection-' + eTypeAdapter.toConnectionType(connectionType));
                    connectionTypesNode.appendChild(connectionTypeNode);
                });
            }
            this._connectionTypesNode = connectionTypesNode;
            return connectionTypesNode;
        };
        ContactRow.prototype._registerBindings = function () {
            var self = this;
            var app = this.get('app');
            var binder = app.get('binder');
            this._bindingHandles.push(binder.bind({
                source: this,
                sourcePath: 'model.image',
                target: this,
                targetPath: 'avatar.image'
            }));
            this._bindingHandles.push(binder.createBinding(this, 'model.displayName').observe(function (change) {
                self._tooltipLabel.set('text', change.value);
            }));
            this._bindingHandles.push(binder.createBinding(this, 'model.connectionTypes').observe(function (change) {
                self._node.removeChild(self._connectionTypesNode);
                self._node.appendChild(self._renderConnectionTypesNode());
            }));
            this._bindingHandles.push(binder.createBinding(this, 'model.isSelected').observe(function (change) {
                self._node.classList.toggle('selected', change.value);
            }));
        };
        ContactRow.prototype._render = function () {
            var model = this.get('model');
            this._avatar = new Avatar({
                image: model.get('image'),
                parent: this
            });
            this._node = document.createElement('div');
            this._node.appendChild(this._avatar.detach());
            this._node.appendChild(this._renderIdentifierNode());
            this._node.appendChild(this._renderConnectionTypesNode());
            this._node.className = 'ContactRow SelectableItem';
            if (model.get('isSelected')) {
                this._node.classList.add('selected');
            }
            this._registerBindings();
        };
        return ContactRow;
    })(SingleNodeWidget);
    var ContactRow;
    (function (ContactRow) {
        ;
        ;
    })(ContactRow || (ContactRow = {}));
    return ContactRow;
});
//# sourceMappingURL=ContactRow.js.map