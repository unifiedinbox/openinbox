/// <amd-dependency path="dstore/QueryResults" />

import Attachment = require('../Attachment');
import Cache = require('dstore/Cache');
import declare = require('dojo/_base/declare');
import endpoints = require('../../endpoints');
import HeaderMixin = require('./HeaderMixin');
import lang = require('dojo/_base/lang');
import request = require('dojo/request');
import Store = require('dstore/Store');
import Trackable = require('dstore/Trackable');
import TrackableMemory = require('./TrackableMemory');

var QueryResults = <any> require('dstore/QueryResults');

interface IServiceAttachment {
	name:string;
	type:string;
	size:number;
}

interface IAttachmentsResponse {
	response: {
		data: {
			data:IServiceAttachment[];
		}
	}[];
}

interface RequestResults {
	data:IPromise<Attachment[]>;
	total:IPromise<number>;
	response:IPromise<any>;
};

interface RangeArgs {
	// This coincides with the declaration in dstore.d.ts, which doesn't have a named interface
	start:number;
	end:number;
}

interface AttachmentStore extends Store<Attachment>, HeaderMixin {};

var AttachmentStore = declare<AttachmentStore>([ Store, Trackable, HeaderMixin ], {

	Model: Attachment,

	_restore: function (attachment:IServiceAttachment):Attachment {
		return new Attachment({
			name: attachment.name,
			type: attachment.type,
			size: attachment.size
		});
	},

	filter(query:any):dstore.ICollection<Attachment> {
		var subcollection = this.inherited(arguments);
		if (query && 'messageId' in query) {
			// Store messageId for potential use with other service endpoints
			subcollection._messageId = query.messageId;
		}
		return subcollection;
	},

	fetch() {
		var results = this._fetchAttachments();
		return new QueryResults(results.data, {
			totalLength: results.total,
			response: results.response
		});
	},

	fetchRange(kwArgs:RangeArgs) {
		// The getAttachments service doesn't actually support ranges, so
		// perform the full request and slice locally
		var results = this._fetchAttachments();

		return new QueryResults(results.data.slice(kwArgs.start, kwArgs.end), {
			totalLength: results.total,
			response: results.response
		});
	},

	_fetchAttachments() {
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

		var response = request.post(endpoints.getAttachments, this._configureRequestOptions(args));
		return this._getAttachmentsResponseHandler(response);
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

	_getAttachmentsResponseHandler(getAttachmentsResponse:any):RequestResults {
		return {
			data: getAttachmentsResponse.then((response:IAttachmentsResponse) => {
				var data:HashMap<any> = <any> response.response[0].data;
				var attachments:any[] = data && (<any> data).data;

				return (!attachments) ? [] : attachments.map(function (result:IServiceAttachment) {
					return this._restore(result);
				}, this);
			}),
			total: getAttachmentsResponse.then(function (response:IAttachmentsResponse) {
				var data = response.response[0].data;
				return data && data.data ? data.data.length : 0;
			}),
			response: getAttachmentsResponse.response
		};
	}
});

Attachment.setDefaultStore((<any> Cache).create(new AttachmentStore({ app: 'app/main' }), {
	cachingStore: new TrackableMemory({ app: 'app/main' })
}));

export = AttachmentStore;
