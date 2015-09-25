define(["require", "exports", '../Folder', 'dojo/_base/declare', '../../endpoints', './HeaderMixin', 'dojo/request/registry', './RequestMemory', './_StoreFilters', 'dstore/Trackable'], function (require, exports, Folder, declare, endpoints, HeaderMixin, request, RequestMemory, _StoreFilters, Trackable) {
    ;
    var FolderStore = declare([RequestMemory, Trackable, HeaderMixin, _StoreFilters], {
        Model: Folder,
        _restore: function (folder, parentFolder) {
            return new Folder({
                id: Number(folder.index),
                isDeletable: folder.permissions.delete,
                isMovable: folder.permissions.move,
                isReadable: folder.permissions.read,
                isRenamable: folder.permissions.rename,
                isWritable: folder.permissions.write,
                name: folder.name,
                parentFolder: parentFolder,
                type: folder.type,
                unreadMessageCount: folder.unreadMessageCount
            });
        },
        _request: function () {
            var _this = this;
            var getFolderListRequest = request.post(endpoints.getAllFolders, {
                headers: this._getAppHeaders(),
                handleAs: 'json'
            });
            return {
                data: getFolderListRequest.then(function (response) {
                    var results = [];
                    response.response[0].data.UNIFIED.forEach(function (result) {
                        _this._restoreFolder(results, result);
                    });
                    return results;
                }),
                total: getFolderListRequest.then(function (response) {
                    return response.response[0].data.UNIFIED.length;
                }),
                response: getFolderListRequest.response
            };
        },
        _restoreFolder: function (folderList, folder, parentFolder) {
            folderList.push(this._restore(folder, parentFolder));
            if (folder.childs && folder.childs.length) {
                for (var i = 0; i < folder.childs.length; i++) {
                    this._restoreFolder(folderList, folder.childs[i], folder.name);
                }
            }
        }
    });
    Folder.setDefaultStore(new FolderStore({ app: 'app/main' }));
    return FolderStore;
});
//# sourceMappingURL=Folder.js.map