var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'dojo/_base/declare', 'dstore/Memory', 'mayhem/Observable', '../models/RecentlyUsedFolder', 'dstore/Trackable'], function (require, exports, declare, Memory, Observable, RecentlyUsedFolder, Trackable) {
    var Session = (function (_super) {
        __extends(Session, _super);
        function Session() {
            _super.apply(this, arguments);
        }
        Session.prototype._storageKeyGetter = function () {
            return this.get('storageKeyPrefix') + this.get('userId');
        };
        Session.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._recentlyUsedFolders = new (declare([Memory, Trackable]))({}).sort('lastUsedDate', true);
            this._userId = 0;
            this._storageKeyPrefix = 'uib-session-';
            this.deserialize();
            var self = this;
            window.onunload = function () {
                self.serialize();
            };
        };
        Session.prototype._prepareFolderInfoForSerialization = function () {
            var folders = [];
            this._recentlyUsedFolders.fetchSync().forEach(function (folder) {
                folders.push({
                    id: folder.get('id'),
                    lastUsedDate: folder.get('lastUsedDate')
                });
            });
            return folders;
        };
        Session.prototype._deserializeRecentlyUsedFolders = function (folders) {
            var self = this;
            folders.forEach(function (folder) {
                self._recentlyUsedFolders.put(new RecentlyUsedFolder({
                    id: folder.id,
                    lastUsedDate: folder.lastUsedDate
                }));
            });
        };
        Session.prototype.serialize = function () {
            var data = {
                recentlyUsedFolders: this._prepareFolderInfoForSerialization()
            };
            localStorage.setItem(this.get('storageKey'), JSON.stringify(data));
        };
        Session.prototype.deserialize = function () {
            var data = JSON.parse(localStorage.getItem(this.get('storageKey')));
            if (data && data.recentlyUsedFolders) {
                this._deserializeRecentlyUsedFolders(data.recentlyUsedFolders);
            }
        };
        return Session;
    })(Observable);
    var Session;
    (function (Session) {
        ;
        ;
    })(Session || (Session = {}));
    return Session;
});
//# sourceMappingURL=Session.js.map