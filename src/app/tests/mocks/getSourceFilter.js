define(["require", "exports", 'app/endpoints', 'dojo/request/registry', './data/getSourceFilter', './util'], function (require, exports, endpoints, registry, sourceData, util) {
    registry.register(endpoints.getSourceFilter, function (url, options) {
        return util.mockJsonResponse({
            response: [{
                data: sourceData
            }]
        }, url, options);
    });
    return registry;
});
//# sourceMappingURL=getSourceFilter.js.map