import Promise = require('mayhem/Promise');

interface IResponse {
	url:string;
	options:any;
	data:any;
	status:number;
	text:string;
	getHeader:(name:string) => string;
}

interface IResponsePromise<T> extends IPromise<T> {
	response:IPromise<IResponse>;
}

export function delay(response:any, time:number = 100):IPromise<any> {
	var promise = new Promise(function (resolve, reject) {
		setTimeout(function () {
			resolve(response);
		}, time);
	});

	return promise;
}

export function mockJsonResponse(data:any, url:string, options:any, time:number = 100,
		status:number = 200, headers:any = {}):IResponsePromise<any> {

	function getHeader(name:string) {
		return headers[name];
	}

	var promise = delay(data, time);
	var newPromise:IResponsePromise<any> = Object.create(promise);
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
