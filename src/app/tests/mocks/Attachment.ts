import endpoints = require('app/endpoints');
import registry = require('dojo/request/registry');
import RequestError = require('dojo/errors/RequestError');
import Promise = require('mayhem/Promise');
import data = require('./data/Attachment');

interface IRequest {
	data: {
		msgIndx:number;
	}
}

registry.register(endpoints.getAttachments, (url:string, request:IRequest) => {
	var promise = new Promise((resolve) => {
		setTimeout(() => {
			if (request.data.msgIndx === 10) {
				resolve({
					response: [
						{
							data: data
						}
					]
				});
			}
			else {
				resolve({
					response: [
						{
							data: []
						}
					]
				})
			}
		}, 100);
	});
	return promise;
});

export = registry;
