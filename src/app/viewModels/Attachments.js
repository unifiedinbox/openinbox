var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Observable', 'mayhem/data/Proxy'], function (require, exports, Observable, Proxy) {
    var sizeUnitKeys = ['b', 'kb', 'mb', 'gb', 'tb'];
    var AttachmentViewModel = (function (_super) {
        __extends(AttachmentViewModel, _super);
        function AttachmentViewModel() {
            _super.apply(this, arguments);
        }
        AttachmentViewModel.prototype._attachmentsGetter = function () {
            return this._attachments;
        };
        AttachmentViewModel.prototype._attachmentsSetter = function (value) {
            this._collection = value;
            if (value) {
                this._attachments = AttachmentProxy.forCollection(value);
            }
        };
        AttachmentViewModel.prototype.delete = function (event) {
            var attachment = event.target.get('attachment');
            if (attachment) {
                this._collection.remove(attachment.get('name'));
            }
        };
        AttachmentViewModel.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._attachments = null;
            this._collection = null;
        };
        AttachmentViewModel.fileExtensions = {
            wav: 'audio',
            mp3: 'audio',
            wma: 'audio',
            aac: 'audio',
            m4a: 'audio',
            flac: 'audio',
            ogg: 'audio',
            xls: 'excel',
            xlsx: 'excel',
            numbers: 'excel',
            jpg: 'image',
            jpeg: 'image',
            png: 'image',
            gif: 'image',
            bmp: 'image',
            svg: 'image',
            ico: 'image',
            tif: 'image',
            tiff: 'image',
            pdf: 'pdf',
            ppt: 'powerpoint',
            pptx: 'powerpoint',
            keynote: 'powerpoint',
            avi: 'video',
            mp4: 'video',
            mov: 'video',
            ogv: 'video',
            mkv: 'video',
            flv: 'video',
            wmv: 'video',
            rm: 'video',
            m4v: 'video',
            '3gp': 'video',
            doc: 'word',
            docx: 'word',
            pages: 'word',
            zip: 'zip',
            rar: 'zip',
            '7z': 'zip'
        };
        return AttachmentViewModel;
    })(Observable);
    var AttachmentProxy = (function (_super) {
        __extends(AttachmentProxy, _super);
        function AttachmentProxy() {
            _super.apply(this, arguments);
            this._defaultIconClass = 'icon-app-template';
        }
        AttachmentProxy.prototype._defaultIconClassGetter = function () {
            return this._defaultIconClass;
        };
        AttachmentProxy.prototype._iconClassDependencies = function () {
            return ['extension'];
        };
        AttachmentProxy.prototype._iconClassGetter = function () {
            var suffix = AttachmentViewModel.fileExtensions[this.get('extension')];
            return suffix ? 'icon-app-file-' + suffix : this.get('defaultIconClass');
        };
        AttachmentProxy.prototype._readableSizeDependencies = function () {
            return ['size'];
        };
        AttachmentProxy.prototype._readableSizeGetter = function () {
            var size = this.get('size');
            var length = sizeUnitKeys.length;
            var index = 0;
            while (size >= 1024 && index < length - 1) {
                size /= 1024;
                index++;
            }
            var messages = this.get('app').get('i18n').get('messages');
            return Math.round(size) + ' ' + messages[sizeUnitKeys[index]]();
        };
        AttachmentProxy.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
        };
        return AttachmentProxy;
    })(Proxy);
    var AttachmentViewModel;
    (function (AttachmentViewModel) {
        AttachmentViewModel.Proxy = AttachmentProxy;
    })(AttachmentViewModel || (AttachmentViewModel = {}));
    return AttachmentViewModel;
});
//# sourceMappingURL=Attachments.js.map