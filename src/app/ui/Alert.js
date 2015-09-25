var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/Label', 'mayhem/ui/dom/SingleNodeWidget', './Icon'], function (require, exports, Label, SingleNodeWidget, Icon) {
    var Alert = (function (_super) {
        __extends(Alert, _super);
        function Alert() {
            _super.apply(this, arguments);
        }
        Alert.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._className = 'Alert';
        };
        Alert.prototype._render = function () {
            var model = this.get('model');
            var command = model.get('command');
            var commitLabel = model.get('commitLabel');
            var actionWrapper;
            var undoWrapper;
            this._node = document.createElement('div');
            this._node.className = this.get('className');
            this._node.textContent = model.get('message');
            if (commitLabel) {
                actionWrapper = document.createElement('span');
                actionWrapper.classList.add('Alert-action');
                this._actionLink = new Label({
                    text: commitLabel,
                    app: this.get('app'),
                    parent: this,
                    type: 0 /* Commit */
                });
                actionWrapper.appendChild(this._actionLink.detach());
                this._node.appendChild(document.createTextNode(' '));
                this._node.appendChild(actionWrapper);
            }
            if (command && command.rollback) {
                undoWrapper = document.createElement('span');
                undoWrapper.classList.add('Alert-undo');
                this._undoLink = new Label({
                    text: model.get('undoLabel') || this.get('app').get('i18n').get('messages').undoQuestion(),
                    app: this.get('app'),
                    parent: this,
                    type: 1 /* Undo */
                });
                undoWrapper.appendChild(this._undoLink.detach());
                this._node.appendChild(document.createTextNode(' '));
                this._node.appendChild(undoWrapper);
            }
            this._icon = new Icon({
                value: 'app-cancel',
                className: 'Alert-close',
                app: this.get('app'),
                parent: this
            });
            this._node.appendChild(this._icon.detach());
        };
        Alert.prototype._isAttachedGetter = function () {
            return this._isAttached;
        };
        Alert.prototype._isAttachedSetter = function (value) {
            this._icon.set('isAttached', value);
            this._undoLink && this._undoLink.set('isAttached', value);
            this._isAttached = value;
        };
        return Alert;
    })(SingleNodeWidget);
    var Alert;
    (function (Alert) {
        (function (LinkType) {
            LinkType[LinkType["Commit"] = 0] = "Commit";
            LinkType[LinkType["Undo"] = 1] = "Undo";
        })(Alert.LinkType || (Alert.LinkType = {}));
        var LinkType = Alert.LinkType;
    })(Alert || (Alert = {}));
    return Alert;
});
//# sourceMappingURL=Alert.js.map