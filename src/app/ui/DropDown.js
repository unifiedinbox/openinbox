var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/DropDown', 'mayhem/Event', 'dojo/_base/lang', 'mayhem/util', '../util'], function (require, exports, BaseDropDown, Event, lang, util, appUtil) {
    var DropDown = (function (_super) {
        __extends(DropDown, _super);
        function DropDown(kwArgs) {
            util.deferSetters(this, ['dropDownClassName'], '_render');
            _super.call(this, kwArgs);
        }
        DropDown.prototype._anchorNodeIdGetter = function () {
            return this._anchorNodeId;
        };
        DropDown.prototype._anchorNodeIdSetter = function (value) {
            this._anchorNodeId = value;
            this._anchorNode = null;
        };
        DropDown.prototype._dropDownClassNameGetter = function () {
            return this._dropDownClassName;
        };
        DropDown.prototype._dropDownClassNameSetter = function (value) {
            if (value) {
                this._dropDownNode.className = 'DropDownContainer ' + value;
            }
        };
        DropDown.prototype._isAttachedSetter = function (value) {
            _super.prototype._isAttachedSetter.call(this, value);
            if (!value && this._isOpen) {
                this.set('isOpen', false);
            }
        };
        DropDown.prototype._isOpenSetter = function (value) {
            _super.prototype._isOpenSetter.call(this, value);
            this._dropDownNode.classList.toggle('open', Boolean(value));
        };
        DropDown.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._isOpenHandle && this._isOpenHandle.remove();
        };
        DropDown.prototype._render = function () {
            var _this = this;
            _super.prototype._render.call(this);
            document.body.appendChild(this._dropDownNode);
            this.on('pointerenter', lang.hitch(this, '_emit', 'dropDownPointerEnter'));
            this.on('pointerleave', lang.hitch(this, '_emit', 'dropDownPointerLeave'));
            this._isOpenHandle = this.get('app').get('binder').createBinding(this, 'isOpen').observe(function (change) {
                _this._emit('dropDownOpen');
            });
        };
        DropDown.prototype._emit = function (type, event) {
            this.emit(new Event({
                type: type,
                bubbles: true,
                cancelable: false,
                target: this,
                relatedTarget: event && event.relatedTarget || null
            }));
        };
        DropDown.prototype._getAnchorNode = function () {
            var anchorNode = this._anchorNode || this._anchorNodeId && document.getElementById(this._anchorNodeId);
            return anchorNode || this._labelNode;
        };
        DropDown.prototype._toggle = function (event) {
            var wasOpen = this.get('isOpen');
            _super.prototype._toggle.call(this, event);
            if (!wasOpen) {
                appUtil.positionNode(this._dropDownNode, this._getAnchorNode());
            }
        };
        return DropDown;
    })(BaseDropDown);
    return DropDown;
});
//# sourceMappingURL=DropDown.js.map