define(["require", "exports", 'app/endpoints', 'dojo/request/registry', 'mayhem/Promise', './data/getAllFolders'], function (require, exports, endpoints, registry, Promise, folderData) {
    registry.register(endpoints.getAllFolders, function (url, options) {
        return Promise.resolve({
            response: [
                {
                    data: folderData
                }
            ]
        });
    });
});
//# sourceMappingURL=getAllFolders.js.map