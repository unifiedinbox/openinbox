import data = require('./data/getContactsList');
import endpoints = require('app/endpoints');
import registry = require('dojo/request/registry');
import util = require('./util');

registry.register(endpoints.getContactsList, function (url:string, options:any) {
	return util.mockJsonResponse({
		response: [ {
			data: data
		} ]
	}, url, options);
});

export = registry;
