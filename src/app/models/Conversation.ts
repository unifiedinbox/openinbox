import PersistentModel = require('mayhem/data/PersistentModel');

class Conversation extends PersistentModel {
	get:Conversation.Getters;
	set:Conversation.Setters;

	// TODO: the showConversation service doesn't actually mention a body field,
	// but without that, where's the actual content of each item in the conversation?
	protected _bcc:string[];
	protected _body:string;
	protected _cc:string[];
	protected _date:Date;
	protected _fromEmail:string;
	protected _fromName:string;
	protected _forwarded:boolean;
	protected _id:string;
	protected _messageId:number;
	protected _replied:boolean;
	protected _subject:string;
	protected _to:string[];

	_initialize():void {
		super._initialize();
		this._bcc = [];
		this._body = '';
		this._cc = [];
		this._date = new Date();
		this._forwarded = false;
		this._fromEmail = '';
		this._fromName = '';
		this._messageId = 0;
		this._replied = false;
		this._subject = '';
		this._to = [];
	}
}

module Conversation {
	export interface Getters extends PersistentModel.Getters {
		(key:'bcc'):string[];
		(key:'body'):string;
		(key:'cc'):string[];
		(key:'date'):Date;
		(key:'forwarded'):boolean;
		(key:'fromEmail'):string;
		(key:'fromName'):string;
		(key:'id'):string;
		(key:'messageId'):number;
		(key:'replied'):boolean;
		(key:'subject'):string;
		(key:'to'):string[];
	}

	export interface Setters extends PersistentModel.Setters {
		(key:'bcc', value:string[]):void;
		(key:'body', value:string):void;
		(key:'cc', value:string[]):void;
		(key:'date', value:Date):void;
		(key:'forwarded', value:boolean):void;
		(key:'fromEmail', value:string):void;
		(key:'fromName', value:string):void;
		(key:'id', value:string):void;
		(key:'messageId', value:number):void;
		(key:'replied', value:boolean):void;
		(key:'subject', value:string):void;
		(key:'to', value:string[]):void;
	}
}

Conversation.setDefaultApp('app/main');
// Store is set in ./stores/Conversation (to prevent circular dependency)

export = Conversation;
