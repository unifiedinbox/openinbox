define(["require", "exports", 'dojo/_base/declare', 'dojo/request', '../Connection', './HeaderMixin', '../../endpoints', './RequestMemory', 'dstore/Trackable'], function (require, exports, declare, request, Connection, HeaderMixin, endpoints, RequestMemory, Trackable) {
    ;
    var ConnectionStore = declare([RequestMemory, HeaderMixin, Trackable], {
        Model: Connection,
        _request: function () {
            var _this = this;
            var connectionsRequest = request.post(endpoints.getSourceFilter, {
                headers: this._getAppHeaders(),
                handleAs: 'json'
            });
            return {
                data: connectionsRequest.then(function (response) {
                    return response.response[0].data.map(function (result) {
                        return _this._restore(result);
                    });
                }),
                total: connectionsRequest.then(function (response) {
                    return response.response[0].data.length;
                }),
                response: connectionsRequest.response
            };
        },
        _restore: function (object) {
            return new Connection({
                id: String(object.intIndx),
                account: object.account,
                type: object.eType,
                itemName: object.itemName,
                name: object.name
            });
        }
    });
    Connection.setDefaultStore(new ConnectionStore({ app: 'app/main', target: endpoints.getSourceFilter }));
    return ConnectionStore;
});
//# sourceMappingURL=Connection.js.map