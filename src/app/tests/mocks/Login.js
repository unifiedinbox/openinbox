define(["require", "exports", 'app/endpoints', 'dojo/request/registry', 'dojo/errors/RequestError', 'mayhem/Promise'], function (require, exports, endpoints, registry, RequestError, Promise) {
    registry.register(endpoints.login, function (url, options) {
        var promise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                if (options.data.username && options.data.password) {
                    resolve({
                        response: [{
                            data: {
                                account_email: 'johndoe@gmail.com',
                                account_id: '1385',
                                account_avatar: 'https://app.unifiedinbox.com/files/../uploads/pop/uploads/11873/dropbox.png',
                                quotes: {
                                    author: 'Mahatma Gandhi',
                                    quotes: 'The future depends on what we do in the present.'
                                },
                                user_full_name: 'John Doe',
                                user_name: 'johndoe'
                            }
                        }]
                    });
                }
                else {
                    reject(new RequestError('some message', { data: {
                        response: [{
                            errors: {
                                message: {
                                    details: {
                                        status: options.data.username || options.data.password ? 401 : 500,
                                        message: ''
                                    }
                                }
                            }
                        }]
                    } }));
                }
            }, 100);
        });
        return promise;
    });
    registry.register(endpoints.logout, function (url) {
        var promise = new Promise(function (resolve) {
            setTimeout(resolve, 100);
        });
        return promise;
    });
});
//# sourceMappingURL=Login.js.map