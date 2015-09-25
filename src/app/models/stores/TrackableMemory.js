define(["require", "exports", 'dojo/_base/declare', 'dstore/Trackable', 'dstore/Memory', './_StoreFilters'], function (require, exports, declare, Trackable, Memory, _StoreFilters) {
    var TrackableMemory = declare([Memory, Trackable, _StoreFilters]);
    return TrackableMemory;
});
//# sourceMappingURL=TrackableMemory.js.map