var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Event', 'mayhem/ui/dom/Label', 'mayhem/ui/ListView', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util', '../Avatar', './ConnectionRow'], function (require, exports, Event, Label, ListView, SingleNodeWidget, util, Avatar, ConnectionRow) {
    var ForwardingConnectionRow = (function (_super) {
        __extends(ForwardingConnectionRow, _super);
        function ForwardingConnectionRow() {
            _super.apply(this, arguments);
        }
        ForwardingConnectionRow.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._forwardConnectionType = true;
        };
        return ForwardingConnectionRow;
    })(ConnectionRow);
    var ConnectionList = (function (_super) {
        __extends(ConnectionList, _super);
        function ConnectionList(kwArgs) {
            util.deferSetters(this, ['collection', 'image'], '_render');
            _super.call(this, kwArgs);
        }
        ConnectionList.prototype._isAttachedGetter = function () {
            return this._isAttached;
        };
        ConnectionList.prototype._isAttachedSetter = function (isAttached) {
            this._listView.set('isAttached', isAttached);
            this._titleLabel.set('isAttached', isAttached);
            this._titleAvatar && this._titleAvatar.set('isAttached', isAttached);
            this._isAttached = isAttached;
        };
        ConnectionList.prototype._collectionGetter = function () {
            return this._collection;
        };
        ConnectionList.prototype._collectionSetter = function (collection) {
            this._collection = collection;
            this._listView.set('collection', collection);
        };
        ConnectionList.prototype._imageGetter = function () {
            return this._image;
        };
        ConnectionList.prototype._imageSetter = function (image) {
            if (this._titleAvatar) {
                this._titleAvatar.detach();
                this._titleAvatar.destroy();
            }
            if (image) {
                var avatar = this._titleAvatar = new Avatar({
                    image: image
                });
                this._titleNode.insertBefore(avatar.detach(), this._titleLabel.get('firstNode'));
            }
        };
        ConnectionList.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._image = this._title = '';
        };
        ConnectionList.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._listView.destroy();
            this._titleLabel.destroy();
            this._titleAvatar && this._titleAvatar.destroy();
        };
        ConnectionList.prototype._onRowActivate = function (event) {
            var target = event.target;
            if (!(target instanceof ConnectionRow)) {
                target = target.get('parent');
            }
            if (target instanceof ConnectionRow) {
                this.emit(new Event({
                    type: 'connectionSelected',
                    bubbles: true,
                    cancelable: false,
                    target: target
                }));
            }
        };
        ConnectionList.prototype._render = function () {
            var node = this._node = document.createElement('div');
            node.className = 'ContactList ConnectionList';
            var titleNode = this._titleNode = document.createElement('div');
            titleNode.className = 'ConnectionList-title';
            node.appendChild(titleNode);
            this._titleLabel = new Label({});
            titleNode.appendChild(this._titleLabel.detach());
            this._listView = new ListView({
                app: this.get('app'),
                parent: this,
                itemConstructor: ForwardingConnectionRow
            });
            var listViewNode = this._listView.detach();
            listViewNode.classList.add('dgrid-autoheight');
            listViewNode.classList.add('ContactList-grid');
            node.appendChild(listViewNode);
            this.get('app').get('binder').bind({
                source: this,
                sourcePath: 'title',
                target: this._titleLabel,
                targetPath: 'text'
            });
            this.on('activate', this._onRowActivate.bind(this));
        };
        return ConnectionList;
    })(SingleNodeWidget);
    return ConnectionList;
});
//# sourceMappingURL=ConnectionList.js.map