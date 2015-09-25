var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './Attachments', '../models/Folder', 'mayhem/data/Proxy', '../models/stores/TrackableMemory'], function (require, exports, AttachmentsViewModel, Folder, Proxy, TrackableMemory) {
    var LOCALSTORAGE_KEY = 'uib-messagecomposition-';
    var NewMessage = (function (_super) {
        __extends(NewMessage, _super);
        function NewMessage() {
            _super.apply(this, arguments);
        }
        NewMessage.prototype._attachmentsModelGetter = function () {
            return this._attachmentsModel;
        };
        NewMessage.prototype._attachmentsModelSetter = function (value) {
            this._attachmentsModel = value;
            this._attachmentsHandle && this._attachmentsHandle.remove();
            if (value) {
                var attachments = value.get('attachments');
                var self = this;
                this._attachmentsHandle = attachments.on('add,delete', function (event) {
                    if (event.type === 'add') {
                        self.set('hasAttachment', true);
                    }
                    else {
                        attachments.fetch().then(function (items) {
                            self.set('hasAttachment', Boolean(items.length));
                        });
                    }
                });
            }
        };
        NewMessage.prototype._selectedFolderGetter = function () {
            return this._selectedFolder;
        };
        NewMessage.prototype._selectedFolderSetter = function (selectedFolder) {
            this._selectedFolder = selectedFolder;
            if (selectedFolder) {
                localStorage.setItem(LOCALSTORAGE_KEY + 'selectedFolder', selectedFolder.get('name'));
            }
        };
        NewMessage.prototype._selectedFolderLabelDependencies = function () {
            return ['selectedFolder'];
        };
        NewMessage.prototype._selectedFolderLabelGetter = function () {
            var _this = this;
            var app = this.get('app');
            var folderName = this._selectedFolder && this._selectedFolder.get('name');
            if (!folderName) {
                folderName = localStorage.getItem(LOCALSTORAGE_KEY + 'selectedFolder');
                if (!folderName && app) {
                    folderName = app.get('i18n').get('messages').archive();
                }
                Folder.store.filter({ name: folderName }).fetch().then(function (folders) {
                    _this._selectedFolder = folders[0];
                });
            }
            this._selectedFolderLabel = folderName;
            return this._selectedFolderLabel;
        };
        NewMessage.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._attachmentsHandle && this._attachmentsHandle.remove();
        };
        NewMessage.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this.set({
                attachmentsModel: new AttachmentsViewModel({
                    attachments: new TrackableMemory({
                        idProperty: 'name'
                    })
                }),
                compositionAction: '',
                isOpen: false,
                moveToFolder: false,
                selectedFolder: null
            });
        };
        return NewMessage;
    })(Proxy);
    return NewMessage;
});
//# sourceMappingURL=NewMessage.js.map