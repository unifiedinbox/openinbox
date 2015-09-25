var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget', '../Avatar', '../TooltipLabel'], function (require, exports, SingleNodeWidget, Avatar, TooltipLabel) {
    var ConnectionRow = (function (_super) {
        __extends(ConnectionRow, _super);
        function ConnectionRow() {
            _super.apply(this, arguments);
        }
        ConnectionRow.prototype._isAttachedSetter = function (value) {
            this._avatar.set('isAttached', value);
            this._tooltipLabel.set('isAttached', value);
            this._isAttached = value;
        };
        ConnectionRow.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._forwardConnectionType = false;
            this._bindingHandles = [];
        };
        ConnectionRow.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._avatar.destroy();
            this._tooltipLabel.destroy();
            this.set('model', undefined);
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        ConnectionRow.prototype._renderIdentifierNode = function () {
            this._tooltipLabel = new TooltipLabel({
                app: this.get('app'),
                text: this._model.get('displayName'),
                parent: this
            });
            var spanNode = this._tooltipLabel.detach();
            spanNode.classList.add('identifier');
            return spanNode;
        };
        ConnectionRow.prototype._registerBindings = function () {
            var self = this;
            var app = this.get('app');
            var binder = app.get('binder');
            if (this._forwardConnectionType) {
                this._bindingHandles.push(binder.bind({
                    source: this,
                    sourcePath: 'model.type',
                    target: this,
                    targetPath: 'avatar.connectionType'
                }));
            }
            this._bindingHandles.push(binder.createBinding(this, 'model.displayName').observe(function (change) {
                self._tooltipLabel.set('text', change.value);
            }));
            this._bindingHandles.push(binder.createBinding(this, 'model.isSelected').observe(function (change) {
                self._node.classList.toggle('selected', change.value);
            }));
        };
        ConnectionRow.prototype._render = function () {
            this._avatar = new Avatar({
                image: '',
                parent: this
            });
            this._node = document.createElement('div');
            this._node.appendChild(this._avatar.detach());
            this._node.appendChild(this._renderIdentifierNode());
            this._node.className = 'ContactRow';
            this._registerBindings();
        };
        return ConnectionRow;
    })(SingleNodeWidget);
    var ConnectionRow;
    (function (ConnectionRow) {
        ;
        ;
    })(ConnectionRow || (ConnectionRow = {}));
    return ConnectionRow;
});
//# sourceMappingURL=ConnectionRow.js.map