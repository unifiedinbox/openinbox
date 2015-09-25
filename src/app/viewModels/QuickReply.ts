import Contact = require('../models/Contact');
import Message = require('../models/Message');
import NewMessageProxy = require('./NewMessage');
import Promise = require('mayhem/Promise');
import TrackableMemory = require('../models/stores/TrackableMemory');

// As these interfaces are only used by protected properties they are defined locally.
interface IContactMap {
	reply:Contact[];
	replyAll:Contact[];
	toNameMap:HashMap<string>;
}

interface IRecipientMapItem {
	contact?:Contact;
	displayName:string;
	field:string;
}

class QuickReply extends NewMessageProxy {
	get:QuickReply.Getters;
	set:QuickReply.Setters;

	// As contacts only need to be fetched once for QuickReply, all of the relevant data are
	// stored on this object. Included are the `reply` and `replyAll` Contact arrays, as well
	// as a `toNameMap` property that maps the user's display name to their original recipient email.
	// The `toNameMap` property is what is used to set the `to` field.
	protected _contactMapPromise:IPromise<IContactMap>;
	protected _initialRecipients:Contact[];

	_lowerCaseToGetter():string {
		return (<any> this.get('app')).get('i18n').get('messages').to().toLowerCase();
	}

	protected _recipients:dstore.ICollection<Contact>;

	protected _replyIcon:string;
	_replyIconDependencies():string[] {
		return [ 'replyType' ];
	}
	_replyIconGetter():string {
		return this._replyType === Message.ReplyType.ReplyAll ? 'icon-app-reply-all' : 'icon-app-reply';
	}

	protected _replyType:Message.ReplyType;
	_replyTypeGetter():Message.ReplyType {
		return this._replyType;
	}
	_replyTypeSetter(value:Message.ReplyType):void {
		this._replyType = value;

		if (this._source) {
			this._getContactMap().then((map:IContactMap):void => {
				var replyAll:boolean = (this._replyType === Message.ReplyType.ReplyAll);

				this.set('initialRecipients', replyAll ? map.replyAll : map.reply);
			});
		}
	}

	protected _selectedRecipients:Contact[];
	_selectedRecipientsGetter():Contact[] {
		return this._selectedRecipients;
	}
	_selectedRecipientsSetter(value:Contact[]):void {
		if (!value || !value.length) {
			if (this._selectedRecipients) {
				this.set('initialRecipients', this._selectedRecipients);
			}
			else {
				this._getContactMap().then((map:IContactMap):void => {
					var replyAll:boolean = this._replyType === Message.ReplyType.ReplyAll;
					var recipients:Contact[] = replyAll ? map.replyAll : map.reply;

					this._setRecipients(recipients);
				});
			}
		}
		else {
			this._setRecipients(value);
		}
	}

	protected _source:Message;

	_toDisplayDependencies():string[] {
		return [ 'to' ];
	}
	_toDisplayGetter():string {

		if (!this._selectedRecipients) {
			return '';
		}

		return this._selectedRecipients.map(function (contact:Contact):string {
			return contact.get('displayName');
		}).join(', ');
	}

	constructor(kwArgs?:HashMap<any>) {
		super(kwArgs);

		// QuickReply will always have the same recipients, so setting the
		// recipients store only needs to happen once.
		this._getContactMap().then((map:IContactMap):void => {
			this.set({
				recipients: <any> new TrackableMemory({
					app: this.get('app'),
					data: map.replyAll
				}),
				initialRecipients: (this._replyType === Message.ReplyType.ReplyAll) ? map.replyAll : map.reply
			});
		});
	}

	_initialize():void {
		super._initialize();

		this._replyIcon = 'icon-app-reply';
		this._initialRecipients = null;
		this.set({
			compositionAction: 'reply', // This will always be 'reply'
			recipients: null,
			replyType: Message.ReplyType.Reply,
			source: null
		});
	}

	protected _getContactMap():IPromise<IContactMap> {
		if (this._contactMapPromise) {
			return this._contactMapPromise;
		}

		var recipients = this._getRecipientMap();

		return Contact.store.forEach(function (contact:Contact):void {
			var accounts:Contact.Account[] = <any> contact.get('accounts');
			var email:string;

			if (accounts) {
				for (var i = accounts.length; i--;) {
					email = accounts[i].address;

					if (recipients[email]) {
						recipients[email].contact = contact;
					}
				}
			}
		}).then(():IPromise<IContactMap> => {
			var contactMap:IContactMap = <any> { reply: [], replyAll: [], toNameMap: {} };

			return <any> Promise.all(Object.keys(recipients).map((email:string):IPromise<void> => {
				var recipient = recipients[email];

				return this._getContact(recipient).then(function (contact:Contact):void {
					if (recipient.field === 'from') {
						contactMap.reply.push(contact);
					}

					contactMap.replyAll.push(contact);
					contactMap.toNameMap[contact.get('displayName')] = recipient.displayName;
				});
			})).then(():IContactMap => {
				this._contactMapPromise = Promise.resolve(contactMap);
				return contactMap;
			});
		});
	}

	protected _getContact(recipient:IRecipientMapItem):IPromise<Contact> {
		if (recipient.contact) {
			return Promise.resolve(recipient.contact);
		}

		return Contact.store.filter({
			displayName: recipient.displayName
		}).fetch().then(function (contacts:Contact[]):IPromise<Contact> {
			if (contacts.length) {
				return Promise.resolve(contacts[0]);
			}

			return Contact.store.put(new Contact({
				displayName: recipient.displayName
			}));
		});
	}

	protected _getRecipientMap():HashMap<IRecipientMapItem> {
		var recipients:HashMap<IRecipientMapItem> = {};
		var from = this._source.get('from');
		var fromEmail:string = Message.parseEmail(from);

		this._setRecipientMapItem(recipients, from, 'from');

		this._source.getReplyRecipients(Message.ReplyType.ReplyAll).forEach((recipient:string) => {
			var email:string = Message.parseEmail(recipient);

			if (recipient !== from && (email && email !== fromEmail)) {
				this._setRecipientMapItem(recipients, recipient);
			}
		});

		return recipients;
	}

	protected _setRecipientMapItem(map:HashMap<IRecipientMapItem>, recipient:string, field:string = 'to'):void {
		var email = Message.parseEmail(recipient);
		var item:IRecipientMapItem = {
			displayName: recipient,
			field: field
		};

		if (email) {
			map[email] = item;
		}
		else {
			map[recipient] = item;
		}
	}

	protected _setRecipients(value:Contact[]):void {
		this._selectedRecipients = value;

		this._getContactMap().then((map:IContactMap):void => {
			this.set('to', value.map((contact:Contact):string => {
				return (<any> map)[contact.get('displayName')];
			}));
		});
	}
}

module QuickReply {
	export interface Getters extends NewMessageProxy.Getters {
		(key:'initialRecipients'):Contact[];
		(key:'lowerCaseTo'):string;
		(key:'recipients'):dstore.ICollection<Contact>;
		(key:'replyIcon'):string;
		(key:'replyType'):Message.ReplyType;
		(key:'toDisplay'):string;
	}

	export interface Setters extends NewMessageProxy.Setters {
		(key:'initialRecipients', value:Contact[]):void;
		(key:'recipients', value:dstore.ICollection<Contact>):void;
		(key:'replyType', value:Message.ReplyType):void;
	}
}

export = QuickReply;
