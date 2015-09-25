import interfaces = require('mayhem/interfaces');
import PersistentModel = require('mayhem/data/PersistentModel');
import TrackableMemory = require('./stores/TrackableMemory');

interface T extends interfaces.IObservable {}

class Notification extends PersistentModel {
	get:Notification.Getters;
	set:Notification.Setters;

	protected _isRead:boolean;
	protected _type:string;

	_initialize():void {
		super._initialize();

		// `this._autoSave` defaults to true since that seems to be the only way to listen
		// for changes to individual items at the collection level.
		this._autoSave = true;
		this._isRead = false;
		this._type = '';
	}
}

module Notification {
	export interface Getters extends PersistentModel.Getters {
		(key:'id'):number;
		(key:'isRead'):boolean;
		(key:'item'):T;
		(key:'type'):string;
	};

	export interface Setters extends PersistentModel.Setters {
		(key:'id', value:number):void;
		(key:'isRead', value:boolean):void;
		(key:'item', value:T):void;
		(key:'type', value:string):void;
	};
}

Notification.setDefaultApp('app/main');
Notification.setDefaultStore(<any> new TrackableMemory());

export = Notification;
