import PersistentModel = require('mayhem/data/PersistentModel');

class Contact extends PersistentModel {
	get:Contact.Getters;
	set:Contact.Setters;

	private _accounts:Contact.Account[];
	private _connectionTypes:string[];
	private _displayName:string;
	private _id:number;
	private _image:string;

	_connectionTypesDependencies() {
		return [ 'accounts' ];
	}

	_connectionTypesGetter() {
		var types:{ [key:string]:boolean } = {};
		this.get('accounts').forEach(function (account) {
			types[account.eType] = true;
		});
		return Object.keys(types);
	}

	_firstNameDependencies() {
		return [ 'displayName' ];
	}

	_firstNameGetter() {
		// TODO: Message rows are supposed to display first name, but it isn't included in getContactsList and
		// we don't want to have to load every individual full contact, so this is a naive carry-over for now
		return this.get('displayName').split(/\s/)[0];
	}

	_initialize():void {
		super._initialize();
		this._displayName = '';
		this._image = '';
		this._accounts = [];
		// At times contacts are created on the fly, and need to be accessed by their ID property.
		this._id = Date.now() * Math.random();
	}
}

module Contact {
	export interface Account {
		address:string;
		eType:string;
		fromaccountindx:string; // Unclear if this is ever not a blank string
	}
	// export enum ConnectionType { none, email, twitter, facebook, linkedin };

	export interface Getters extends PersistentModel.Getters {
		(key:'accounts'):Account[];
		(key:'connectionTypes'):string[];
		(key:'displayName'):string;
		(key:'firstName'):string;
		(key:'id'):number;
		(key:'image'):string;
	}

	export interface Setters extends PersistentModel.Setters {
		(key:'accounts', value:Account[]):void;
		(key:'id', value:number):void;
		(key:'image', value:string):void;
	}
}

Contact.setDefaultApp('app/main');
// setDefaultStore is called from the store module to avoid a circular dependency

export = Contact;
