import Attachment = require('../models/Attachment');
import AttachmentViewModel = require('./Attachments');
import Contact = require('../models/Contact');
import data = require('mayhem/data/interfaces');
import lang = require('dojo/_base/lang');
import Folder = require('../models/Folder');
import Message = require('../models/Message');
import Promise = require('mayhem/Promise');
import Proxy = require('mayhem/data/Proxy');
import util = require('../util');

// TODO: There will likely be identical/very similar data at the route level (the following will
// hold true for managing multiple messages). We might benefit from a separate module for this.
var messageActionsData = {
	draft: {
		hideArchive: true,
		hideFolders: true,
		hideMarkAs: true,
		hideDistribute: true,
		hideMore: true
	},

	// TODO: are there any actions/folders that should be excluded in the `send` view?
	sent: {},
	none: {}
};

class MessageProxy extends Proxy<Message> {
	get:MessageProxy.Getters;
	set:MessageProxy.Setters;

	protected _attachments:dstore.ICollection<AttachmentViewModel.Proxy>;
	_attachmentsGetter():dstore.ICollection<AttachmentViewModel.Proxy> {
		return this._attachments;
	}
	_attachmentsSetter(value:dstore.ICollection<Attachment>):void {
		if (value) {
			this._attachments = <any> AttachmentViewModel.Proxy.forCollection(value);
		}
	}

	protected _compositionAction:string;

	/**
	 * Since the getAllMessages API does not return contact IDs, but only `from` and `to` strings,
	 * they need to be mapped back to Contact objects in order for them to work properly with the
	 * Avatar widget. If they cannot be mapped back to an existing contact, then the display name
	 * and first `to` name will be used as-is.
	 */
	_contactsDependencies():string[] {
		return [ 'from', 'to', 'folderId' ];
	}
	_contactsGetter():IPromise<HashMap<any>> {
		return this.get('rowType').then((rowType:string):IPromise<HashMap<any>> => {
			if (rowType === 'draft') {
				return this._getDraftContacts();
			}
			else if (rowType === 'sent') {
				return this._getOutboxContacts();
			}
			else {
				return this._getContacts().then((contacts:any[]):HashMap<any> => {
					var to:Contact[] = contacts.slice(1);
					var first = contacts[0];

					return {
						image: (first instanceof Contact) ? first.get('image') : '',
						text: this._getContactText(contacts),
						participantCount: to.length > 1 ? to.length : 0
					};
				});
			}
		});
	}

	_dateLabelGetter():string {
		var now:Date = new Date();
		var date:Date = <any> this.get('date');
		var i18n = (<any> this.get('app')).get('i18n');

		return !date ? '' : i18n.formatDate(date, {
			datePattern: (date.getFullYear() !== now.getFullYear()) ? 'yyyy MMM d' : 'MMM d',
			timePattern: 'h:mma'
		});
	}

	// smartDate isn't explicitly used, but as it updates the `isScheduled` check will perform again,
	// making it possible to track when scheduled messages are actually sent and update the view accordingly.
	_isScheduledDependencies():string[] {
		return [ 'smartDate' ];
	}
	_isScheduledGetter():boolean {
		var date:Date = <any> this.get('date');

		return date && date.getTime() > Date.now();
	}

	_messageActionsDataGetter():IPromise<HashMap<any>> {
		return this.get('rowType').then(function (type:string):HashMap<any> {
			return <any> lang.mixin({}, (<any> messageActionsData)[type]);
		});
	}

	_privacyIconClassDependencies():string[] {
		return [ 'commentCount', 'privacyStatus' ];
	}
	_privacyIconClassGetter():string {
		var status:string = this.get('privacyStatus') || '';
		var classes:string[] = [ 'MessageRow-privacy--' + status.replace('privacy-', '') ];

		if (this.get('commentCount')) {
			classes.push('has-comments');
		}

		return classes.join(' ');
	}

	_rowTypeGetter():IPromise<string> {
		// TODO: We may want to consider storing the message types in a static property
		// of Message. For example, Message.types.DRAFT.
		return (this.get('messageType') === 'c') ?
			Promise.resolve('draft') :
			Folder.get(this.get('folderId')).then(function (folder:Folder):string {
				var name:string = <any> folder && folder.get('name');

				return (name === 'Outbox' || name === 'Sent') ? 'sent' : 'none';
			});
	}

	// TODO: This functionality is also in app/viewModels/NotificationList.
	protected _smartDate:string;
	_smartDateGetter():string {
		var messages = (<any> this.get('app').get('i18n')).get('messages');
		var date:Date = <any> this.get('date');

		return util.formatSmartTime(date, messages);
	}

	protected _smartDateTimer:number;

	// `isSelected` comes from SelectionManager
	_stateClassesDependencies():string[] {
		return [ 'isRead', 'isSelected', 'isStarred', 'replied', 'forwarded' ];
	}
	_stateClassesGetter():string {
		var states:string[] = [ 'isSelected', 'isStarred' ];
		var pattern = /^is[A-Z]/;
		var classes:string[] = [];

		classes.push((this.get('isRead')) ? 'is-read' : 'is-unread');

		// TODO: Only one "action" icon (forwarded/replied) will be displayed at a time. The following
		// assumes only `forwarded` or `replied` will be assigned at a time, but I'm not sure of the
		// best way to handle this.
		if ((<any> this.get('replied'))) {
			classes.push('is-replied');
		}

		if ((<any> this.get('forwarded'))) {
			classes.push('is-forwarded');
		}

		states.forEach((state:string):void => {
			if (this.get(state)) {
				classes.push('is-' + (pattern.test(state) ? state.charAt(2).toLowerCase() + state.slice(3) : state));
			}
		});

		return classes.join(' ');
	}

	constructor(kwArgs?:HashMap<any>) {
	    super(kwArgs);
	    this._setDateWatcher();
	}

	destroy():void {
		super.destroy();
		clearTimeout(this._smartDateTimer);
	}

	_initialize():void {
		super._initialize();

		this.set('compositionAction', null);
	}

	protected _getContacts(excludeFrom:boolean = false):IPromise<any[]> {
		var names:string[] = excludeFrom ? [] : [ this.get('from') ];
		var to:string[] = <any> this.get('to') || [];
		var promises = (to.length ? names.concat(to) : names).map((name:string) => {
			return Contact.store.filter({ displayName: name }).fetch().then(function (contacts:Contact[]):any {
				return contacts.length ? contacts[0] : name;
			});
		});

		return Promise.all(promises);
	}

	protected _getContactDisplayName(contact:string, getFullName?:boolean):string;
	protected _getContactDisplayName(contact:Contact, getFullName?:boolean):string;
	protected _getContactDisplayName(contact:any, getFullName:boolean = false):string {
		var primary = getFullName ? 'displayName' : 'firstName';
		var secondary = getFullName ? 'firstName' : 'displayName';

		return (typeof contact === 'string') ? contact :
			(contact.get(primary) || contact.get(secondary));
	}

	protected _getContactText(contacts:any[]):string {
		var first = contacts[0];
		var second = contacts.length === 2 && contacts[1];

		if (!first) {
			return '';
		}

		if (second) {
			return this._getContactDisplayName(first) + ', ' + this._getContactDisplayName(second);
		}

		return this._getContactDisplayName(first, true);
	}

	protected _getDraftContacts():IPromise<HashMap<any>> {
		var app = <any> this.get('app');
		var messages = <any> app.get('i18n').get('messages');

		return <any> Promise.resolve({
			image: app.get('user').get('data').get('image'),
			label: messages.draft()
		});
	}

	protected _getOutboxContacts():IPromise<HashMap<any>> {
		return <any> this._getContacts(true).then((to:any[]) => {
			var app = <any> this.get('app');

			return {
				image: app.get('user').get('data').get('image'),
		 	 	text: this._getContactText(to),
		 	 	participantCount: to.length > 2 ? to.length - 2 : 0
			};
		});
	}

	// TODO: This should be moved out of the proxy and into either the MessageList widget or
	// into a proper view model, since we don't want dozens of these setTimeouts. But once again,
	// how would we iterate over the current collection without making calls to the database?
	protected _setDateWatcher():void {
		var self = this;

		function updateSmartDate():void {
			self._setSmartDate();
			self._smartDateTimer = setTimeout(updateSmartDate, 60000);
		}

		this._smartDateTimer = setTimeout(updateSmartDate, 60000);
	}

	protected _setSmartDate():void {
		var oldDate = this._smartDate;
		this._smartDate = this.get('smartDate');
		this._notify('smartDate', this._smartDate, oldDate);
	}
}

module MessageProxy {
	export interface Getters extends Message.Getters, Proxy.Getters {
		(key:'attachments'):dstore.ICollection<AttachmentViewModel.Proxy>;
		(key:'compositionAction'):string;
		(key:'contacts'):IPromise<HashMap<any>>;
		(key:'dateLabel'):string;
		(key:'isScheduled'):boolean;
		(key:'messageActionsData'):IPromise<HashMap<any>>;
		(key:'privacyIconClass'):string;
		(key:'rowType'):IPromise<string>;
		(key:'showAttachments'):boolean;
		(key:'smartDate'):string;
		(key:'stateClasses'):string;
	}

	export interface Setters extends Message.Setters, Proxy.Setters {
		(key:'attachments', value:dstore.ICollection<Attachment>):void;
		(key:'compositionAction', value:string):void;
		(key:'showAttachments', value:boolean):void;
		(key:'stateClasses', value:string):void;
	}
}

export = MessageProxy;
