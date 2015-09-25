import endpoints = require('app/endpoints');
import registry = require('dojo/request/registry');
import RequestError = require('dojo/errors/RequestError');
import Promise = require('mayhem/Promise');
import User = require('app/auth/User');

interface IOptions {
	data:User.IAuthenticateArgs;
}

registry.register(endpoints.login, function (url:string, options:IOptions) {
	var promise = new Promise(function (resolve, reject) {
		setTimeout(function () {
			if (options.data.username && options.data.password) {
				resolve({
					response: [ {
						data: {
							// NOTE: Login service doesn't currently expose a UIB username field,
							// but email is supposedly going to be replaced by username in the account menu in the UI.
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
					} ]
				});
			}
			else {
				// Note: The top-level data key here is to match the structure of dojo/request response objects
				reject(new RequestError('some message', { data: {
					response: [ {
						errors: {
							message: {
								details: {
									status: options.data.username || options.data.password ? 401 : 500,
									message:''
								}
							}
						}
					} ]
				} }));
			}
		}, 100);
	});

	return promise;
});

registry.register(endpoints.logout, function (url:string) {
	var promise = new Promise(function (resolve) {
		setTimeout(resolve, 100);
	});

	return promise;
});
