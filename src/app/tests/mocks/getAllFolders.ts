import endpoints = require('app/endpoints');
import registry = require('dojo/request/registry');
import Promise = require('mayhem/Promise');
import folderData = require('./data/getAllFolders');

registry.register(endpoints.getAllFolders, function (url:string, options:any) {
	return Promise.resolve({
		response: [
			{
				data: folderData
			}
		]
	});
});
