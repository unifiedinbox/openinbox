var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget', 'dojo/dom-construct', 'dstore/Memory', 'dojo/on', '../models/Attachment'], function (require, exports, SingleNodeWidget, domConstruct, Memory, on, Attachment) {
    var AddAttachment = (function (_super) {
        __extends(AddAttachment, _super);
        function AddAttachment() {
            _super.apply(this, arguments);
        }
        AddAttachment.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._collection = new Memory({});
        };
        AddAttachment.prototype._render = function () {
            var node = this._node = document.createElement('div');
            node.className = 'AddAttachment';
            this._labelNode = domConstruct.create('span', {
                className: 'Attachments-label icon-app-attachment'
            }, node);
            var inputNode = this._inputNode = domConstruct.create('input', {
                className: 'Attachments-input',
                type: 'file',
                multiple: true
            }, node);
            on(inputNode, 'change', this._onFileChange.bind(this));
        };
        AddAttachment.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._collection.forEach(function (attachment) {
                var previewUrl = attachment.get('previewUrl');
                if (previewUrl.indexOf('blob:') === 0) {
                    URL.revokeObjectURL(previewUrl);
                }
                attachment.remove();
                attachment.destroy();
            });
        };
        AddAttachment.prototype._onFileChange = function (event) {
            var files = event.target.files;
            for (var i = 0, length = files.length; i < length; i++) {
                var file = files[i];
                this._collection.add(new Attachment({
                    app: this.get('app'),
                    store: this._collection,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    previewUrl: this._generatePreviewUrl(file)
                }));
            }
            this._inputNode.value = '';
        };
        AddAttachment.prototype._generatePreviewUrl = function (file) {
            if (file.type.indexOf('image/') !== -1) {
                return URL.createObjectURL(file);
            }
            return '';
        };
        return AddAttachment;
    })(SingleNodeWidget);
    return AddAttachment;
});
//# sourceMappingURL=AddAttachment.js.map