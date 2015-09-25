var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/data/Model', './Folder'], function (require, exports, Model, Folder) {
    var RecentlyUsedFolder = (function (_super) {
        __extends(RecentlyUsedFolder, _super);
        function RecentlyUsedFolder() {
            _super.apply(this, arguments);
        }
        RecentlyUsedFolder.getFolders = function (collection, limit) {
            if (limit === void 0) { limit = 3; }
            return collection.fetchRange({
                start: 0,
                end: limit
            }).then(function (folders) {
                var folderIds = [];
                var dates = {};
                folders.forEach(function (folder) {
                    var id = folder.get('id');
                    folderIds.push(id);
                    dates[id] = folder.get('lastUsedDate');
                });
                return Folder.store.include(folderIds).sort(function (left, right) {
                    var leftId = left.get('id');
                    var rightId = right.get('id');
                    return dates[leftId] < dates[rightId] ? 1 : -1;
                });
            });
        };
        RecentlyUsedFolder.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._lastUsedDate = Number(new Date());
        };
        return RecentlyUsedFolder;
    })(Model);
    RecentlyUsedFolder.setDefaultApp('app/main');
    return RecentlyUsedFolder;
});
//# sourceMappingURL=RecentlyUsedFolder.js.map