var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/ListView', '../../viewModels/ConversationList', './ConversationRow', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util'], function (require, exports, ListView, ConversationProxy, ConversationRow, SingleNodeWidget, util) {
    ;
    var ConversationList = (function (_super) {
        __extends(ConversationList, _super);
        function ConversationList(kwArgs) {
            util.deferSetters(this, ['collection'], '_render');
            _super.call(this, kwArgs);
        }
        ConversationList.prototype._collectionGetter = function () {
            return this._collection;
        };
        ConversationList.prototype._collectionSetter = function (value) {
            if (value) {
                this._collection = ConversationProxy.forCollection(value).sort('date', true);
                this._listView.set('collection', this._collection);
            }
        };
        ConversationList.prototype._isAttachedSetter = function (value) {
            this._isAttached = value;
            this._listView.set('isAttached', value);
        };
        ConversationList.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._listView.destroy();
            this._collection = null;
            this._message = null;
        };
        ConversationList.prototype._render = function () {
            this._node = document.createElement('div');
            this._node.className = 'ConversationList dgrid-autoheight';
            this._listView = new ListView({
                app: this.get('app'),
                itemConstructor: ConversationRow,
                parent: this
            });
            this._node.appendChild(this._listView.detach());
        };
        return ConversationList;
    })(SingleNodeWidget);
    return ConversationList;
});
//# sourceMappingURL=ConversationList.js.map