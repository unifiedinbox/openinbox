import PersistentModel = require('mayhem/data/PersistentModel');

class Connection extends PersistentModel {
	get:Connection.Getters;
	set:Connection.Setters;

	protected _account:string;
	protected _type:string;
	protected _id:string;
	protected _itemName:string;
	protected _name:string;

	/*
	 * displayName is aliased, so that displayName can be used both for contact and connection row widgets
	 */

	protected _displayNameDependencies() {
		return [ 'account' ];
	}

	protected _displayNameGetter() {
		return this.get('account');
	}

	_initialize():void {
		super._initialize();
		this._account = '';
		this._type = '';
		this._itemName = '';
		this._name = '';
	}
}

module Connection {
	export interface Getters extends PersistentModel.Getters {
		(key:'account'):string;
		(key:'type'):string;
		(key:'displayName'):string;
		(key:'id'):string;
		(key:'itemName'):string;
		(key:'name'):string;
	}

	export interface Setters extends PersistentModel.Setters {
		(key:'account', value:string):void;
		(key:'type', value:string):void;
		(key:'id', value:string):void;
		(key:'itemName', value:string):void;
		(key:'name', value:string):void;
	}
}

Connection.setDefaultApp('app/main');
// setDefaultStore is called from the store module to avoid a circular dependency

export = Connection;
