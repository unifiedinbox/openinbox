define(["require", "exports", 'dojo/_base/declare'], function (require, exports, declare) {
    var UibStoreFilters = declare(null, {
        include: function (included, key) {
            var filter = new this.Filter();
            key = key || this.idProperty;
            return included ? this.filter(filter.in(key, included)) : this;
        },
        exclude: function (excluded, key) {
            key = key || this.idProperty;
            if (!excluded) {
                return this;
            }
            return this.filter(function (item) {
                var filtered = excluded.every(function (value) {
                    var actual = item.get(key);
                    return value !== actual;
                });
                return filtered;
            });
        }
    });
    return UibStoreFilters;
});
//# sourceMappingURL=_StoreFilters.js.map