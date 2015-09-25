import declare = require('dojo/_base/declare');
import request = require('dojo/request');
import Connection = require('../Connection');
import HeaderMixin = require('./HeaderMixin');
import endpoints = require('../../endpoints');
import RequestMemory = require('./RequestMemory');
import Trackable = require('dstore/Trackable');

interface IServiceConnection {
	intIndx:number|string;
	account:string;
	eType:string;
	itemName:string;
	name:string;
}

interface ConnectionStore extends RequestMemory<Connection>, HeaderMixin {};

var ConnectionStore = declare<RequestMemory<Connection>>([ RequestMemory, HeaderMixin, Trackable ], {
	Model: Connection,

	_request: function () {
		var connectionsRequest = request.post(endpoints.getSourceFilter, {
			headers: this._getAppHeaders(),
			handleAs: 'json'
		});

		return {
			data: connectionsRequest.then((response:IListServiceResponse) => {
				return response.response[0].data.map((result:IServiceConnection) => {
					return this._restore(result);
				});
			}),

			total: connectionsRequest.then((response:IListServiceResponse) => {
				return response.response[0].data.length;
			}),

			response: (<any> connectionsRequest).response
		};
	},

	_restore: function (object:IServiceConnection) {
		return new Connection({
			id: String(object.intIndx), // intIndx is sometimes, but not always, a string
			account: object.account,
			type: object.eType,
			itemName: object.itemName,
			name: object.name
		});
	}
});

Connection.setDefaultStore(new ConnectionStore({ app: 'app/main', target: endpoints.getSourceFilter }));

export = ConnectionStore;
