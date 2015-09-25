var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget'], function (require, exports, SingleNodeWidget) {
    var Icon = (function (_super) {
        __extends(Icon, _super);
        function Icon() {
            _super.apply(this, arguments);
        }
        Icon.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._className = '';
            this._value = 'app-cancel';
        };
        Icon.prototype._render = function () {
            var className = this.get('className');
            this._node = document.createElement('i');
            this._node.className = 'icon-' + this.get('value') + (className ? ' ' + className : '');
        };
        return Icon;
    })(SingleNodeWidget);
    return Icon;
});
//# sourceMappingURL=Icon.js.map