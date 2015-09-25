var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget', 'dojo/dom-construct', 'dojo/dom-class', '../../util'], function (require, exports, SingleNodeWidget, domConstruct, domClass, util) {
    var FolderRow = (function (_super) {
        __extends(FolderRow, _super);
        function FolderRow() {
            _super.apply(this, arguments);
        }
        FolderRow.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._bindingHandles = [];
        };
        FolderRow.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.set('model', null);
            this._bindingHandles.forEach(function (handle) {
                handle.remove();
            });
        };
        FolderRow.prototype._render = function () {
            this._node = domConstruct.create('div', {
                className: this._getClassName()
            });
            this._renderName();
            this._renderMessageCount();
            this._registerBindings();
        };
        FolderRow.prototype._getClassName = function () {
            var name = this.get('model').get('name');
            var className = 'Folder Folder--' + util.toCamelCase(name);
            var model = this.get('model');
            if (model.get('isHighlighted')) {
                className += ' is-highlighted';
            }
            if (model.get('type')) {
                className += ' Folder--' + model.get('type');
            }
            return className;
        };
        FolderRow.prototype._renderName = function () {
            var nameTextNode = document.createTextNode(this.get('model').get('name'));
            this._nameNode = domConstruct.create('a', {
                className: 'Folder-link'
            });
            this._nameNode.appendChild(nameTextNode);
            this._node.appendChild(this._nameNode);
        };
        FolderRow.prototype._renderMessageCount = function () {
            var count = Number(this.get('model').get('unreadMessageCount'));
            var className = 'Folder-unreadCount';
            if (!count) {
                className += ' is-hidden';
            }
            this._unreadCountNode = domConstruct.create('span', {
                className: className
            });
            this._unreadCountTextNode = document.createTextNode(String(count));
            this._unreadCountNode.appendChild(this._unreadCountTextNode);
            this._node.appendChild(this._unreadCountNode);
        };
        FolderRow.prototype._registerBindings = function () {
            var _this = this;
            var app = this.get('app');
            var model = this.get('model');
            var binder = app.get('binder');
            var self = this;
            if (this._unreadCountTextNode) {
                this._bindingHandles.push(binder.createBinding(model, 'unreadMessageCount').observe(function (change) {
                    self._unreadCountTextNode.nodeValue = String(change.value);
                    domClass.toggle(self._unreadCountNode, 'is-hidden', change.value < 1);
                }));
            }
            this._bindingHandles.push(binder.createBinding(model, 'isHighlighted').observe(function (change) {
                _this._node.classList.toggle('is-highlighted', change.value);
            }));
        };
        return FolderRow;
    })(SingleNodeWidget);
    var FolderRow;
    (function (FolderRow) {
        ;
        ;
    })(FolderRow || (FolderRow = {}));
    return FolderRow;
});
//# sourceMappingURL=FolderRow.js.map