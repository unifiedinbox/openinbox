import Contact = require('../Contact');
import declare = require('dojo/_base/declare');
import endpoints = require('../../endpoints');
import HeaderMixin = require('./HeaderMixin');
import request = require('dojo/request');
import RequestMemory = require('./RequestMemory');
import Trackable = require('dstore/Trackable');

interface IAccount {
	eType:string;
	address:string;
	fromaccountindx:string;
}

interface IServiceContact {
	name:string;
	imagepath:string;
	intIndx:number;
	accounts: IAccount[];
}

interface IRequest {
	data:IPromise<Contact[]>;
	total:IPromise<number>;
	response:IPromise<Contact[]>;
}

interface ContactStore extends RequestMemory<Contact>, HeaderMixin {};

var ContactStore = declare<ContactStore>([ RequestMemory, Trackable, HeaderMixin ], {

	Model: Contact,

	_request: function ():IRequest {
		var getContactListRequest = request.post(endpoints.getContactsList, {
			headers: this._getAppHeaders(),
			handleAs: 'json'
		});

		return {
			data: getContactListRequest.then((response:IListServiceResponse) => {
				return response.response[0].data.map((result:IServiceContact) => {
					return this._restore(result);
				});
			}),

			total: getContactListRequest.then((response:IListServiceResponse) => {
				return response.response[0].data.length;
			}),

			response: (<any> getContactListRequest).response
		};
	},

	_restore: function (contact:IServiceContact):Contact {
		return new Contact({
			accounts: contact.accounts,
			displayName: contact.name,
			id: contact.intIndx,
			image: contact.imagepath
		});
	}
});

Contact.setDefaultStore(new ContactStore({ app: 'app/main' }));

export = ContactStore;
