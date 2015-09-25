define(["require", "exports", 'app/endpoints', 'dojo/request/registry', 'mayhem/Promise', './data/Attachment'], function (require, exports, endpoints, registry, Promise, data) {
    registry.register(endpoints.getAttachments, function (url, request) {
        var promise = new Promise(function (resolve) {
            setTimeout(function () {
                if (request.data.msgIndx === 10) {
                    resolve({
                        response: [
                            {
                                data: data
                            }
                        ]
                    });
                }
                else {
                    resolve({
                        response: [
                            {
                                data: []
                            }
                        ]
                    });
                }
            }, 100);
        });
        return promise;
    });
    return registry;
});
//# sourceMappingURL=Attachment.js.map