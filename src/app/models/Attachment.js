var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/PersistentModel'], function (require, exports, PersistentModel) {
    var Attachment = (function (_super) {
        __extends(Attachment, _super);
        function Attachment() {
            _super.apply(this, arguments);
        }
        Attachment.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._name = '';
            this._type = '';
            this._size = 0;
            this._previewUrl = '';
        };
        Attachment.prototype._extensionDependencies = function () {
            return ['name'];
        };
        Attachment.prototype._extensionGetter = function () {
            var name = this.get('name');
            var extensionIndex = name.lastIndexOf('.');
            return extensionIndex !== -1 ? name.slice(extensionIndex + 1) : '';
        };
        return Attachment;
    })(PersistentModel);
    Attachment.setDefaultApp('app/main');
    return Attachment;
});
//# sourceMappingURL=Attachment.js.map