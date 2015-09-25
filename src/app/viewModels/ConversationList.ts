import Contact = require('../models/Contact');
import Conversation = require('../models/Conversation');
import endpoints = require('../endpoints');
import Message = require('../models/Message');
import Proxy = require('mayhem/data/Proxy');
import util = require('../util');

class ConversationProxy extends Proxy<Conversation> {
	get:ConversationProxy.Getters;
	set:ConversationProxy.Setters;

	// TODO: This functionality is also in app/viewModels/NotificationList.
	protected _smartDate:string;
	_smartDateGetter():string {
		var i18nMessages = (<any> this.get('app').get('i18n')).get('messages');
		var date:Date = <any> this.get('date');

		return util.formatSmartTime(date, i18nMessages);
	}

	_bccGetter():string {
		return this.get('target').get('bcc').join(', ');
	}

	_ccGetter():string {
		return this.get('target').get('cc').join(', ');
	}

	_toGetter():string {
		return this.get('target').get('to').join(', ');
	}

	_hasCcGetter():boolean {
		return this.get('cc').length > 0;
	}

	_hasBccGetter():boolean {
		return this.get('bcc').length > 0;
	}

	_contactImageGetter():IPromise<string> {
		return Contact.store.filter({
			displayName: this.get('fromName')
		}).fetch().then(function (contacts:Contact[]):string {
			var first = contacts[0];

			return (first instanceof Contact) ? <string> first.get('image') : '';
		});
	}

	_viewSourceLinkGetter():string {
		return endpoints.viewMessageSource + '?messageId=' + this.get('messageId');
	}

	constructor(kwArgs?:HashMap<any>) {
	    super(kwArgs);
	    this._setDateWatcher();
	}

	destroy():void {
		super.destroy();
		if (this._smartDateTimeoutHandle) {
			clearTimeout(this._smartDateTimeoutHandle);
			this._smartDateTimeoutHandle = undefined;
		}
	}

	protected _smartDateTimeoutHandle:number;

	protected _setDateWatcher():void {
		var self = this;

		function updateSmartDate():void {
			self._setSmartDate();
			self._smartDateTimeoutHandle = setTimeout(updateSmartDate, 60000);
		}

		this._smartDateTimeoutHandle = setTimeout(updateSmartDate, 60000);
	}

	protected _setSmartDate():void {
		var oldDate = this._smartDate;
		this._smartDate = this.get('smartDate');
		this._notify('smartDate', this._smartDate, oldDate);
	}
}

module ConversationProxy {
	export interface Getters extends Conversation.Getters, Proxy.Getters {
		(key:'message'):Message;
		(key:'smartDate'):string;
		(key:'target'):Conversation;
	}

	export interface Setters extends Conversation.Setters, Proxy.Setters {
		(key:'message', message:Message):void;
	}
}

export = ConversationProxy;
