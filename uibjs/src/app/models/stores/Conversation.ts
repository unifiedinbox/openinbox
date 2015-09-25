/// <amd-dependency path="dstore/QueryResults" />

import Conversation = require('../Conversation');
import declare = require('dojo/_base/declare');
import endpoints = require('../../endpoints');
import HeaderMixin = require('./HeaderMixin');
import lang = require('dojo/_base/lang');
import request = require('dojo/request');
import Store = require('dstore/Store');
import Trackable = require('dstore/Trackable');

var QueryResults = <any> require('dstore/QueryResults');

interface IServiceConversation {
	bcc:string[];
	body:string;
	cc:string[];
	dtDate:string;
	email_from:string;
	forwarded:string;
	from:string;
	msg_index:string;
	replied:string;
	showsubject:string;
	to:string[];
	vchMessageID:string;
}

interface IConversationResponse {
	response: {
		data: IServiceConversation[];
	}[];
}

interface RequestResults {
	data:IPromise<Conversation[]>;
	total:IPromise<number>;
	response:IPromise<any>;
};

interface RangeArgs {
	// This coincides with the declaration in dstore.d.ts, which doesn't have a named interface
	start:number;
	end:number;
}

interface ConversationStore extends Store<Conversation>, HeaderMixin {};

var ConversationStore = declare<ConversationStore>([ Store, Trackable, HeaderMixin ], {

	Model: Conversation,

	_restore: function (object:IServiceConversation) {
		return new Conversation({
			bcc: object.bcc,
			body: object.body, // TODO: not included in service
			cc: object.cc,
			date: new Date(object.dtDate.replace(' ', 'T') + 'Z'), // TODO: are these times actually UTC?
			forwarded: object.forwarded !== 'n',
			fromEmail: object.email_from,
			fromName: object.from,
			id: object.vchMessageID, // TODO: is this really the identifier for items in this service?
			messageId: Number(object.msg_index),
			replied: object.replied !== 'n',
			subject: object.showsubject, // TODO: there are 3 subject fields - which one?
			to: object.to
		});
	},

	filter(query:any):dstore.ICollection<Conversation> {
		var subcollection = this.inherited(arguments);
		if (query && 'messageId' in query) {
			// Store messageId for potential use with other service endpoints
			subcollection._messageId = query.messageId;
		}
		return subcollection;
	},

	fetch() {
		var results = this._fetchConversation();
		return new QueryResults(results.data, {
			totalLength: results.total,
			response: results.response
		});
	},

	fetchRange(kwArgs:RangeArgs) {
		// The showConversation service doesn't actually support ranges, so
		// perform the full request and slice locally
		var results = this._fetchConversation();

		return new QueryResults(results.data.slice ? results.data.slice(kwArgs.start, kwArgs.end) : results.data, {
			totalLength: results.total,
			response: results.response
		});
	},

	_fetchConversation() {
		var args:{ [key:string]:any } = {};

		this.queryLog.forEach(function (entry:any) {
			if (entry.type === 'filter') {
				entry.normalizedArguments.forEach(function (arg:any) {
					if (arg.type === 'eq') {
						args[arg.args[0]] = arg.args[1];
					}
				});
			}
		});

		var response = request.post(endpoints.showConversation, this._configureRequestOptions(args));
		return this._showConversationResponseHandler(response);
	},

	_configureRequestOptions: function (kwArgs:any) {
		var headers = this._getAppHeaders();
		if (!headers) {
			throw new Error('Session headers have not been set; please ensure User login has completed successfully.');
		}

		headers = lang.delegate(headers, { Accept: this.accepts });

		return {
			handleAs: 'json',
			headers: headers,
			data: {
				msgIndx: kwArgs.messageId
			}
		};
	},

	_showConversationResponseHandler(showConversationResponse:any):RequestResults {
		return {
			data: showConversationResponse.then((response:IListServiceResponse) => {
				return response.response[0].data.map(function (result:IServiceConversation) {
					return this._restore(result);
				}, this);
			}),
			total: showConversationResponse.then(function (response:IListServiceResponse) {
				return response.response[0].data ? response.response[0].data.length : 0;
			}),
			response: showConversationResponse.response
		};
	}
});

Conversation.setDefaultStore(new ConversationStore({ app: 'app/main' }));

export = ConversationStore;
