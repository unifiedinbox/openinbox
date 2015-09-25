define(["require", "exports", 'dojo/_base/declare', 'dojo/aspect', 'dstore/Cache', 'dojo/store/util/QueryResults', 'dstore/Request', 'dstore/legacy/DstoreAdapter'], function (require, exports, declare, aspect, Cache, QueryResults, Request, DstoreAdapter) {
    ;
    aspect.after(DstoreAdapter.prototype, 'query', function (queryResults) {
        if (!(queryResults instanceof QueryResults)) {
            queryResults = new QueryResults(queryResults);
        }
        return queryResults;
    });
    var RequestMemory = declare([Request, Cache], {
        isValidFetchCache: true,
        constructor: function () {
            this.root = this;
        },
        _fetchFirst: function () {
            if (!this.root._hasFetched) {
                this.root._hasFetched = true;
                this.root.fetch.apply(this.root, arguments);
            }
        },
        evictAll: function () {
            this.allLoaded = false;
            this._hasFetched = false;
            this.cachingStore.setData([]);
        }
    });
    var storeMethods = ['get', 'fetch', 'fetchRange', 'add', 'put', 'remove'];
    storeMethods.forEach(function (method) {
        aspect.before(RequestMemory.prototype, method, RequestMemory.prototype._fetchFirst);
    });
    return RequestMemory;
});
//# sourceMappingURL=RequestMemory.js.map