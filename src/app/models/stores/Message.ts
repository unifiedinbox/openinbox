/// <amd-dependency path="dstore/QueryResults" />

import Promise = require('mayhem/Promise');
import declare = require('dojo/_base/declare');
import lang = require('dojo/_base/lang');
import request = require('dojo/request');
import Memory = require('dstore/Memory');
import Store = require('dstore/Store');
import Trackable = require('dstore/Trackable');
import Attachment = require('../Attachment');
import AttachmentStore = require('./Attachment'); AttachmentStore; // Ensure Attachment.store is populated
import endpoints = require('../../endpoints');
import HeaderMixin = require('./HeaderMixin');
import MessageModel = require('../Message');

var QueryResults = <any> require('dstore/QueryResults');

// For use with `ViewStandardFilters`
var standardFiltersMap = {
	// starredMessages: 'starred_mails',
	myMessages: 'mymessages',
	newMessages: 'new_mails_comments'
};

var searchInMap = {
	messages: 1,
	people: 3,
	attachments: 4,
	comments: 5,
	tags: 6,
	subject: 7,
	from: 8,
	to: 9
};

interface RequestResults {
	data:IPromise<any>;
	response:IPromise<any>;
	total?:IPromise<number>;
}

interface RangeArgs {
	// This coincides with the declaration in dstore.d.ts, which doesn't have a named interface
	start:number;
	end:number;
}

interface MessageStore<T> extends Store<T>, HeaderMixin {
	new (kwArgs:HashMap<any>):MessageStore<T>;
}

var MessageStore = declare<MessageStore<MessageModel>>([ Store, HeaderMixin, Trackable ], {
	headers: null,
	target: '',
	accepts: 'application/json',

	constructor(kwArgs:HashMap<any>) {
		this._filter = {};
	},

	// add/put are not intended to actually add data to the store
	// (other APIs are responsible for that)
	// Having these methods implemented with dummy implementations allows add/update events to
	// be emitted correct(ish)ly
	add(item:MessageModel):IPromise<MessageModel> {
		return Promise.resolve(item);
	},

	put(item:MessageModel):IPromise<MessageModel> {
		return Promise.resolve(item);
	},

	filter(query:any):dstore.ICollection<MessageModel> {
		var subcollection = this.inherited(arguments);
		if (query && 'folderId' in query) {
			// Store folderId for potential use with other service endpoints
			subcollection._folderId = query.folderId;
		}
		return subcollection;
	},

	search(search:string, type:string = 'people'):void {
		var filterArgs:HashMap<any>;

		if (type === 'standardFilter') {
			filterArgs = <any> { ViewStandardFilters: [ (<any> standardFiltersMap)[search] ] };
		}
		else if (type === 'all') {
			filterArgs = { customSearch: true, searchPattern: search };
		}
		else {
			// The API allows multiple `searchInFolder` and `searchIn` parameters to be specified,
			// but currently the application only needs to specify one folder and one `searchIn`
			// target at a time.
			filterArgs = {
				'searchInFolder[]': 1, // Search all folders
				'searchIn[]': ((<any> searchInMap)[type] || searchInMap.people),
				searchPattern: search
			};
		}

		return this.filter(filterArgs);
	},

	// TODO: This will be removed once `mayhem/data/Proxy` no longer requires stores to have a `fetch` method.
	// DO NOT USE.
	fetch() {
		return this.fetchRange({ start: 0, end: 100 });
	},

	fetchRange(kwArgs:MessageStore.RangeArgs) {
		var args:{ [key:string]:any } = this._applyFilters({
			startrecord: kwArgs.start,
			limit: kwArgs.end - kwArgs.start
		});

		var response = request.post(endpoints.getAllMessages,
			this._configureRequestOptions(args));
		var results = this._getAllMessagesResponseHandler(response);

		return new QueryResults(results.data, {
			totalLength: results.total,
			response: results.response
		});
	},

	getMessageCounts():IPromise<HashMap<number>> {
		return this._actionRequest(endpoints.getMessageCounts).then(function (data:HashMap<string>):HashMap<number> {
			var pattern = /(_[a-z])/g;

			return <any> Object.keys(data).reduce(function (mapped:HashMap<number>, key:string):HashMap<number> {
				var camelCaseKey:string = key.replace(pattern, function (matched:string):string {
					return matched.toUpperCase().replace('_', '');
				});

				(<any> mapped)[camelCaseKey] = Number((<any> data)[key]);
				return mapped;
			}, {});
		});
	},

	archive(id:string) {
		return this._actionRequest(
			endpoints.archiveMessage,
			{
				msgindx: id,
				folderIndex: this._folderId
			}
		);
	},

	moveToFolder(kwArgs:MessageStore.MoveToFolderArgs) {
		var args = {
			chkmsgindx: kwArgs.messageIds.join(','),
			targetFolder: kwArgs.targetFolder
		};

		return this._actionRequest(endpoints.moveToFolder, args);
	},

	markAs(kwArgs:MessageStore.MarkAsArgs) {
		var args:any = {
			msgIndx: JSON.stringify(kwArgs.messageIds),
			currentFolder: this._folderId
		};
		var url:string;

		switch (kwArgs.status) {
			case MessageModel.Status.Read:
				url = endpoints.markAsRead;
				break;

			case MessageModel.Status.Unread:
				url = endpoints.markAsUnread;
				break;

			case MessageModel.Status.Junk:
				url = endpoints.markAsJunk;
				break;

			case MessageModel.Status.NotJunk:
				url = endpoints.markAsNotJunk;
				break;

			case MessageModel.Status.Starred:
				args.starStatus = 'Y';
				url = endpoints.markAsStarred;
				break;

			case MessageModel.Status.Unstarred:
				args.starStatus = 'N';
				url = endpoints.markAsStarred;
				break;
		}

		return this._actionRequest(url, args);
	},

	blacklistSender(kwArgs:MessageStore.MultiMessageArgs) {
		return this._actionRequest(
			endpoints.blacklistSender,
			{
				msgIndx: JSON.stringify(kwArgs.messageIds),
				currentFolder: this._folderId
			}
		);
	},

	whitelistSender(kwArgs:MessageStore.MultiMessageArgs) {
		return this._actionRequest(
			endpoints.whitelistSender,
			{
				msgIndx: JSON.stringify(kwArgs.messageIds),
				currentFolder: this._folderId
			}
		);
	},

	forward(message:MessageModel, withHeader:boolean = false) {
		return this._createSendArgs(message).then((args:MessageStore.SendArgs):IPromise<any> => {
			args.mForwardmsgIndx = String(message.get('sourceId'));
			args.withHeader = withHeader ? 'true' : 'false';

			return this._actionRequest(endpoints.forwardMessage, args);
		});
	},

	delete(kwArgs:MessageStore.MultiMessageArgs) {
		return this._actionRequest(
			endpoints.deleteMessage,
			{
				chkmsgindx: JSON.stringify(kwArgs.messageIds),
				lbfolders: this._folderId
			}
		);
	},

	reply(message:MessageModel) {
		return this._createSendArgs(message).then((args:MessageStore.SendArgs):IPromise<any> => {
			args.mReplyTomsgIndx = String(message.get('sourceId'));

			return this._actionRequest(endpoints.replyMessage, args);
		});
	},

	send(message:MessageModel) {
		return this._createSendArgs(message).then((args:MessageStore.SendArgs):IPromise<any> => {
			return this._actionRequest(endpoints.sendMessage, args);
		});
	},

	saveAsDraft(message:MessageModel, action?:string) {
		return this._createSendArgs(message).then((args:MessageStore.SendArgs):IPromise<any> => {
			var distributeField:string;

			if (action) {
				distributeField = (action === 'forward') ? 'mForwardmsgIndx' : 'mReplyTomsgIndx';
				(<any> args)[distributeField] = String(message.get('sourceId'));
			}

			return this._actionRequest(endpoints.saveAsDraft, args);
		});
	},

	_restore(object:any):MessageModel {
		var id = object.msg_index;
		var hasAttachment = object.attachment !== '0';
		var restored = new MessageModel({
			attachments: hasAttachment ? Attachment.store.filter({ messageId: id }) : <any> new Memory(),
			avatar: object.sender_avatarLink,
			bcc: object.msg_bcc && object.msg_bcc.split(',') || [],
			cc: object.msg_cc && object.msg_cc.split(',') || [],
			commentCount: Number(object.commentCount),
			connectionType: object.accType,
			date: new Date(object.vchdate),
			folderId: object.categoryIndx,
			forwarded: object.forwarded === 'y',
			from: object.from,
			hasAttachment: hasAttachment,
			id: id,
			isJunk: object.safe !== 'Safe',
			isRead: object.status === 'true',
			isStarred: object.star_status === 'Y',
			labels: object.labels.data,
			messageType: object.mMessageType,
			priority: Number(object.priority),
			privacyStatus: object.privacyStatus,
			replied: object.replied === 'y',
			subject: object.subject,
			to: object.to && object.to.split(',') || []
		});

		return restored;
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
			data: !kwArgs ? kwArgs : Object.keys(kwArgs).reduce(function (data:HashMap<any>, key:string):HashMap<any> {
				if (key === 'folderId') {
					(<any> data).folderid = kwArgs.folderId;
				}
				else {
					(<any> data)[key] = kwArgs[key];
				}

				return data;
			}, <any> {})
		};
	},

	_actionRequest(apiMethod:string, kwArgs:any, responseHandler?:(response:any) => IPromise<any>):IPromise<any> {
		var promise = request.post(apiMethod, this._configureRequestOptions(kwArgs));
		var requestResults = responseHandler ? responseHandler(promise) : this._defaultResponseHandler(promise);
		return lang.delegate(requestResults.data, { response: requestResults.response });
	},

	_applyFilters(kwArgs:HashMap<any>):HashMap<any> {
		var slice = Array.prototype.slice;

		function checkFilter(arg:any) {
			if (arg.type === 'eq') {
				kwArgs[arg.args[0]] = arg.args[1];
			}
			else if (arg.type === 'and') {
				slice.call(arg.args).forEach(checkFilter);
			}
		}

		this.queryLog.forEach(function (entry:any) {
			if (entry.type === 'filter') {
				entry.normalizedArguments.forEach(checkFilter);
			}
		});

		return kwArgs;
	},

	_getAllMessagesResponseHandler(response:any):RequestResults {
		var self = this;

		return {
			data: response.then(function (response:any) {
				var results = response.response[0].data[1];

				for (var i = 0; i < results.length; i++) {
					results[i] = self._restore(results[i], true);
				}

				return results;
			}),
			total: response.then(function (response:any) {
				return response.response[0].data[2];
			}),
			response: response.response
		};
	},

	_defaultResponseHandler(response:any):RequestResults {
		return {
			data: response.then(function (response:any) {
				var result = response.response;

				if (result[0] && result[0].data) {
					result = result[0].data;
				}

				return result;
			}),
			response: response.response
		};
	},

	_createSendArgs(message:MessageModel):IPromise<MessageStore.SendArgs> {
		var attachments = message.get('attachments');
		var sendArgs:MessageStore.SendArgs = {
			fromEmail: message.get('from'),
			// TODO: fdfrom_email:from email account index
			to: message.get('to').join(','),
			cc: message.get('cc').join(','),
			bcc: message.get('bcc').join(','),
			subject: message.get('subject'),
			content: message.get('body'),
			comboPriority: String(message.get('priority')),
			readconfirm: message.get('readReceipt') ? 'true' : 'false',
			replyTo: message.get('replyTo'),
			messageformat: String(message.get('format'))
		};

		if (!attachments) {
			return Promise.resolve(sendArgs);
		}

		return attachments.fetch().then(function (attachments:Attachment[]):MessageStore.SendArgs {
			// TODO: Send the attachment data, not the model objects.
			// sendArgs.uploadedFiles = attachments;

			return sendArgs;
		});
	}
});

MessageModel.setDefaultStore(new MessageStore({ app: 'app/main' }));

module MessageStore {
	export interface LabelArgs extends MultiMessageArgs {
		labelId:string;
	}

	export interface MarkAsArgs extends MultiMessageArgs {
		status:MessageModel.Status;
	}

	export interface MoveToFolderArgs extends MultiMessageArgs {
		targetFolder:string;
	}

	export interface MultiMessageArgs {
		messageIds:string[];
	}

	export interface RangeArgs {
		start:number;
		end:number;
		headers?:HashMap<any>;
	}

	export interface SendArgs {
		fromEmail:string;
		to:string;
		cc:string;
		bcc:string;
		subject:string;
		content:string;
		comboPriority:string;
		readconfirm:string;
		replyTo:string;
		messageformat:string;
		mForwardmsgIndx?:string;
		mReplyTomsgIndx?:string;
		uploadedFiles?:Attachment[];
		withHeader?:string;
	}
}

export = MessageStore;
