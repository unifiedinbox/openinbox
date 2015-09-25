import endpoints = require('app/endpoints');
import registry = require('dojo/request/registry');
import sourceData = require('./data/getSourceFilter');
import util = require('./util');

registry.register(endpoints.getSourceFilter, function (url:string, options:any) {
	return util.mockJsonResponse({
		response: [ {
			data: sourceData
		} ]
	}, url, options);
});

export = registry;
