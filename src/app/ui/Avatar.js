var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util', 'dojo/dom-construct', '../models/adapters/eType'], function (require, exports, SingleNodeWidget, util, domConstruct, eTypeAdapter) {
    function escapeCssUrl(url) {
        return url.replace(/([\"\\])/g, '\\$1');
    }
    var Avatar = (function (_super) {
        __extends(Avatar, _super);
        function Avatar(kwArgs) {
            util.deferSetters(this, ['image', 'connectionType'], '_render');
            _super.call(this, kwArgs);
        }
        Avatar.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this.set('image', '');
            this.set('connectionType', '');
        };
        Avatar.prototype._imageGetter = function () {
            return this._image;
        };
        Avatar.prototype._imageSetter = function (image) {
            var hasImage = image && image.length > 2;
            domConstruct.empty(this._node);
            this._node.classList.toggle('Avatar-no-image', !hasImage);
            this._node.classList.toggle('Avatar-default', !image);
            if (hasImage) {
                this._node.style.backgroundImage = 'url("' + escapeCssUrl(image) + '")';
            }
            else {
                this._node.style.backgroundImage = '';
                this._initialsNode = document.createTextNode(image || 'k');
                this._node.appendChild(this._initialsNode);
            }
            this._image = image;
        };
        Avatar.prototype._connectionTypeGetter = function () {
            return this._connectionType;
        };
        Avatar.prototype._connectionTypeSetter = function (connectionType) {
            this._node.classList.remove('connection-' + (eTypeAdapter.toConnectionType(this._connectionType) || 'none'));
            this._node.classList.add('connection-' + (eTypeAdapter.toConnectionType(connectionType) || 'none'));
            this._connectionType = connectionType;
        };
        Avatar.prototype._render = function () {
            this._node = document.createElement('div');
            this._node.className = 'Avatar';
        };
        return Avatar;
    })(SingleNodeWidget);
    return Avatar;
});
//# sourceMappingURL=Avatar.js.map