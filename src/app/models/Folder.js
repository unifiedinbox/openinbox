var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/PersistentModel'], function (require, exports, PersistentModel) {
    var Folder = (function (_super) {
        __extends(Folder, _super);
        function Folder() {
            _super.apply(this, arguments);
        }
        Folder.updateUnreadCount = function (message, previous) {
            var id = Number(message.get('folderId'));
            if (typeof previous === 'number') {
                Folder.get(previous).then(function (folder) {
                    folder.updateUnreadCount(true);
                });
            }
            return Folder.get(id).then(function (folder) {
                folder.updateUnreadCount(Boolean(message.get('isRead')));
                return folder;
            });
        };
        Folder.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._isDeletable = true;
            this._isMovable = true;
            this._isReadable = true;
            this._isRenamable = true;
            this._isWritable = true;
            this._name = '';
            this._type = '';
            this._parentFolder = '';
            this._unreadMessageCount = 0;
        };
        Folder.prototype.updateUnreadCount = function (isRead) {
            var count = this._unreadMessageCount;
            this.set('unreadMessageCount', Math.max(0, count + (isRead ? -1 : 1)));
        };
        return Folder;
    })(PersistentModel);
    Folder.setDefaultApp('app/main');
    return Folder;
});
//# sourceMappingURL=Folder.js.map