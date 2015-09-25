import Attachment = require('./Attachment');
import Folder = require('./Folder');
import PersistentModel = require('mayhem/data/PersistentModel');
import User = require('../auth/User');

// The listView scenario should be active when the message is being displayed in a message list view
var listViewScenario = [
	'folderId',
	'isBlacklisted',
	'isJunk',
	'isRead',
	'isStarred',
	'labels',
	'priority',
	'privacyStatus',
];

// The new scenario should be active when a message is being composed
var newScenario = [
	'attachments',
	'bcc',
	'body',
	'cc',
	'connectionType',
	'folderId',
	'format',
	'from',
	'hasAttachment',
	'labels',
	'messageType',
	'priority',
	'privacyStatus',
	'readReceipt',
	'replyTo',
	'subject',
	'to'
];

// The forward scenario should be active when a message is being forwarded
var forwardScenario = [
	'attachments',
	'bcc',
	'body',
	'cc',
	'connectionType',
	'folderId',
	'format',
	'forwarded',
	'from',
	'hasAttachment',
	'labels',
	'messageType',
	'priority',
	'privacyStatus',
	'readReceipt',
	'replyTo',
	'sourceId',
	'subject',
	'to'
];

// The reply scenario should be active when a message is being replied to
var replyScenario = [
	'attachments',
	'bcc',
	'body',
	'cc',
	'connectionType',
	'folderId',
	'format',
	'from',
	'hasAttachment',
	'labels',
	'messageType',
	'priority',
	'privacyStatus',
	'readReceipt',
	'replied',
	'replyTo',
	'sourceId',
	'subject',
	'to'
];

var replyCloneProperties = [
	'connectionType',
	'folderId',
	'format',
	'hasAttachment',
	'labels',
	'messageType',
	'priority',
	'privacyStatus',
	'sourceId',
	'subject',
];

var forwardCloneProperties = replyCloneProperties.concat([ 'attachments', 'body' ]);

class Message extends PersistentModel {
	static getForwardMessage(message:Message):Message {
		return this._getDistributedMessage(message, 'forward');
	}

	static getReplyMessage(message:Message, replyType:Message.ReplyType = Message.ReplyType.Reply):Message {
		return this._getDistributedMessage(message, 'reply', replyType);
	}

	static parseEmail(recipient:string):string {
		// Recipients can be in any of the following formats:
		// email
		// name <email>
		// <name> email
		// <email>
		var email = recipient.trim();
		var bracketedEmail = /^(?:[^\<\>]+)?\<([^\>]+)\>$/;
		var bracketedName = /^(?:\<[^\<]+\>)?(.*)/;

		return email.replace(bracketedEmail, '$1').replace(bracketedName, '$1').trim();
	}

	protected static _getDistributedMessage(message:Message, scenario:string, replyType?:Message.ReplyType):Message {
		var blank:Message;
		var cloneProperties:string[];

		if (message) {
			blank = new Message({ app: message.get('app') });

			blank.set('scenario', scenario);

			cloneProperties = (scenario === 'forward') ? forwardCloneProperties : replyCloneProperties;
			cloneProperties.forEach(function (property:string):void {
				blank.set(property, message.get(property));
			});

			this._setRecipients(message, blank, scenario, replyType);
		}

		return blank;
	}

	protected static _setRecipients(
		message:Message,
		blank:Message,
		scenario:string,
		replyType?:Message.ReplyType
	):void {
		var user:User = <any> message.get('app').get('user');
		var userEmail:string = user.get('data').get('email');

		blank.set('from', userEmail);

		if (scenario === 'reply') {
			blank.set('to', message.getReplyRecipients(replyType));
		}
	}

	get:Message.Getters;
	set:Message.Setters;

	protected _avatar:string;
	protected _bcc:string[];
	protected _body:string;
	protected _cc:string[];
	protected _commentCount:number;
	protected _connectionType:string;
	protected _date:Date;
	protected _folderId:number;
	protected _folderName:string;
	protected _format:Message.Format;
	protected _forwarded:boolean;
	protected _from:string;
	protected _hasAttachment:boolean;
	protected _isBlacklisted:boolean;
	protected _isJunk:boolean;
	protected _isRead:boolean;
	protected _isStarred:boolean;
	protected _labels:string[];
	protected _messageType:string;
	protected _priority:Message.Priority;
	protected _privacyStatus:string;
	protected _readReceipt:boolean;
	protected _replied:boolean;
	protected _replyTo:string;
	protected _subject:string;
	protected _to:string[];

	_scenarios:HashMap<string[]>;

	protected __loaded:boolean;

	constructor(kwArgs:HashMap<any>) {
		super(kwArgs);

		this.__loaded = true;
		this.set('scenario', 'listView');
	}

	_initialize():void {
		super._initialize();

		// Set data defaults
		this._avatar = '';
		this._bcc = [];
		this._body = '';
		this._cc = [];
		this._commentCount = 0;
		this._connectionType = '';
		this._date = null;
		this._folderId = 0;
		this._folderName = '';
		this._format = Message.Format.Plain;
		this._forwarded = false;
		this._from = '';
		this._hasAttachment = false;
		this._isBlacklisted = false;
		this._isJunk = false;
		this._isRead = false;
		this._isStarred = false;
		this._labels = [];
		this._messageType = '';
		this._priority = Message.Priority.Normal;
		this._privacyStatus = '';
		this._readReceipt = false;
		this._replied = false;
		this._replyTo = '';
		this._subject = '';
		this._to = [];
	}

	_folderIdGetter():number {
		return this._folderId;
	}
	_folderIdSetter(folderId:number):void {
		if (this.get('folderId') === folderId) {
			return;
		}

		var id = this.get('id');
		var store:any = this.get('store');
		var previousId:number = this.get('folderId');

		this._folderId = folderId;

		// If the object is being created, exit early to avoid calling store methods
		if (!this.__loaded) {
			return;
		}

		if (id) {
			store.moveToFolder({
				messageIds: [ id ],
				targetFolder: folderId
			});

			Folder.updateUnreadCount(this, previousId);
		}
	}

	_isBlacklistedGetter():boolean {
		return this._isBlacklisted;
	}
	_isBlacklistedSetter(isBlacklisted:boolean):void {
		var id = this.get('id');
		var store:any = this.get('store');
		var method = isBlacklisted ? 'blacklistSender' : 'whitelistSender';

		if (this._setProperty('isBlacklisted', isBlacklisted) && id) {
			(<any> store)[method]({ messageIds: [ id ]});
		}
	}

	_isJunkGetter():boolean {
		return this._isJunk;
	}
	_isJunkSetter(isJunk:boolean):void {
		this._setStatus('isJunk', isJunk, Message.Status.Junk, Message.Status.NotJunk);
	}

	_isReadGetter():boolean {
		return this._isRead;
	}
	_isReadSetter(isRead:boolean):void {
		var previousState:boolean = this.get('isRead');

		this._setStatus('isRead', isRead, Message.Status.Read, Message.Status.Unread);

		if (previousState !== isRead) {
			Folder.updateUnreadCount(this);
		}
	}

	_isStarredGetter():boolean {
		return this._isStarred;
	}
	_isStarredSetter(isStarred:boolean):void {
		this._setStatus('isStarred', isStarred, Message.Status.Starred, Message.Status.Unstarred);
	}

	_participantsGetter() {
		return [this.get('from')].concat(this.get('to'));
	}

	getReplyRecipients(replyType:Message.ReplyType = Message.ReplyType.Reply):string[] {
		var user:User = <any> this._app.get('user');
		var userEmail:string = user.get('data').get('email');
		var recipients:string[] = [ this.get('from') ];

		return replyType === Message.ReplyType.Reply ? recipients :
			recipients.concat(this.get('to'), this.get('cc')).filter((recipient:string):boolean => {
				return Message.parseEmail(recipient) !== userEmail;
			});
	}

	protected _setStatus(propertyName:string, value:boolean, trueValue?:Message.Status, falseValue?:Message.Status):void {
		var id = this.get('id');
		var store:any = this.get('store');

		if (this._setProperty(propertyName, value) && id) {
			store.markAs({
				messageIds: [id],
				status: value ? trueValue : falseValue
			});
		}
	}

	protected _setProperty(propertyName:string, value:boolean):boolean {
		if (<any> this.get(propertyName) === value) {
			return;
		}

		(<any> this)['_' + propertyName] = value;

		// If the object is being created, exit early to avoid calling store methods
		return this.__loaded;
	}
}

module Message {
	// Priority should map to UIB API values: 1...5, Highest...Lowest; it can also be 0 if unspecified
	export enum Priority { Unspecified, Highest, High, Normal, Low, Lowest }
	// These are not mutually exclusive and not intended to be used by consumers of this module
	// They are used internally by the message store, but the Message model provides a get/set API for each pair here:
	// isRead, isJunk, isStarred
	export enum Status { Read, Unread, Junk, NotJunk, Starred, Unstarred }
	// Only text/plain supported for now
	export enum Format { Plain, Html }
	export enum ReplyType { Reply, ReplyAll }

	export interface Getters extends PersistentModel.Getters {
		(key:'attachments'):dstore.ICollection<Attachment>;
		(key:'avatar'):string;
		(key:'bcc'):string[];
		(key:'body'):string;
		(key:'cc'):string[];
		(key:'commentCount'):number;
		(key:'connectionType'):string;
		(key:'date'):Date;
		(key:'folderId'):number;
		(key:'format'):Message.Format;
		(key:'forwarded'):boolean;
		(key:'from'):string;
		(key:'hasAttachment'):boolean;
		(key:'id'):string;
		(key:'isBlacklisted'):boolean;
		(key:'isJunk'):boolean;
		(key:'isRead'):boolean;
		(key:'isStarred'):boolean;
		(key:'labels'):string[];
		(key:'messageType'):string;
		(key:'participants'):string[];
		(key:'priority'):Message.Priority;
		(key:'privacyStatus'):string;
		(key:'readReceipt'):boolean;
		(key:'replied'):boolean;
		(key:'replyTo'):string;
		(key:'sourceId'):number;
		(key:'subject'):string;
		(key:'to'):string[];
	}

	export interface Setters extends PersistentModel.Setters {
		(key:'attachments', value:dstore.ICollection<Attachment>):void;
		(key:'avatar', value:string):void;
		(key:'bcc', value:string[]):void;
		(key:'body', value:string):void;
		(key:'cc', value:string[]):void;
		(key:'commentCount', value:number):void;
		(key:'connectionType', value:string):void;
		(key:'date', value:Date):void;
		(key:'folderId', value:number):void;
		(key:'format', value:Message.Format):void;
		(key:'forwarded', value:boolean):void;
		(key:'from', value:string):void;
		(key:'hasAttachment', value:boolean):void;
		(key:'id', value:string):void;
		(key:'isBlacklisted', value:boolean):void;
		(key:'isJunk', value:boolean):void;
		(key:'isRead', value:boolean):void;
		(key:'isStarred', value:boolean):void;
		(key:'messageType', value:string):void;
		(key:'priority', value:Message.Priority):void;
		(key:'privacyStatus', value:string):void;
		(key:'readReceipt', value:boolean):void;
		(key:'replied', value:boolean):void;
		(key:'replyTo', value:string):void;
		(key:'sourceId', value:number):void;
		(key:'subject', value:string):void;
		(key:'to', value:string[]):void;
	}
}

Message.prototype._scenarios = {
	listView: listViewScenario,
	new: newScenario,
	forward: forwardScenario,
	reply: replyScenario
};

Message.setDefaultApp('app/main');
// setDefaultStore is called from the store module to avoid a circular dependency

export = Message;
