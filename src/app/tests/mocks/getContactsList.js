define(["require", "exports", './data/getContactsList', 'app/endpoints', 'dojo/request/registry', './util'], function (require, exports, data, endpoints, registry, util) {
    registry.register(endpoints.getContactsList, function (url, options) {
        return util.mockJsonResponse({
            response: [{
                data: data
            }]
        }, url, options);
    });
    return registry;
});
//# sourceMappingURL=getContactsList.js.map