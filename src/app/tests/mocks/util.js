define(["require", "exports", 'mayhem/Promise'], function (require, exports, Promise) {
    function delay(response, time) {
        if (time === void 0) { time = 100; }
        var promise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(response);
            }, time);
        });
        return promise;
    }
    exports.delay = delay;
    function mockJsonResponse(data, url, options, time, status, headers) {
        if (time === void 0) { time = 100; }
        if (status === void 0) { status = 200; }
        if (headers === void 0) { headers = {}; }
        function getHeader(name) {
            return headers[name];
        }
        var promise = delay(data, time);
        var newPromise = Object.create(promise);
        newPromise.response = promise.then(function () {
            return {
                url: url,
                options: options,
                data: data,
                status: status,
                text: JSON.stringify(data),
                getHeader: getHeader
            };
        });
        return newPromise;
    }
    exports.mockJsonResponse = mockJsonResponse;
});
//# sourceMappingURL=util.js.map