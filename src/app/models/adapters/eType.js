define(["require", "exports"], function (require, exports) {
    var eTypeMap = {
        E: 'email',
        M: 'facebook',
        L: 'linkedin',
        A: 'twitter'
    };
    var connectionTypes = Object.keys(eTypeMap).map(function (key) {
        return eTypeMap[key];
    });
    function toConnectionType(eType) {
        return eTypeMap[eType];
    }
    exports.toConnectionType = toConnectionType;
    function forEachType(callback, context) {
        Object.keys(eTypeMap).forEach(callback, context);
    }
    exports.forEachType = forEachType;
    function forEachConnectionType(callback, context) {
        connectionTypes.forEach(callback, context);
    }
    exports.forEachConnectionType = forEachConnectionType;
});
//# sourceMappingURL=eType.js.map