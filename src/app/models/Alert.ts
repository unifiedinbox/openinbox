/**
 * WARNING: this model stores Function objects in its "command" property. This is fine as long as the model is only
 * used in-memory, but if the data is ever serialized this will have to be taken into consideration.
 */

import PersistentModel = require('mayhem/data/PersistentModel');
import declare = require('dojo/_base/declare');
import Memory = require('dstore/Memory');
import Trackable = require('dstore/Trackable');
import CommandManager = require('../CommandManager');

class Alert extends PersistentModel {
	get:Alert.Getters;
	set:Alert.Setters;

	protected _message:string;
	protected _command:CommandManager.ICommand;
	protected _commitLabel:string;
	protected _undoLabel:string;
	protected _isPermanent:boolean;

	constructor(kwArgs:HashMap<any>) {
		super(kwArgs);

		// If an action is specified then the alert should not auto-timeout
		if (this.get('commitLabel') || this.get('undoLabel')) {
			this.set('isPermanent', true);
		}
	}

	_initialize():void {
		super._initialize();

		this._message = '';
		this._command = null;
		this._commitLabel = '';
		this._undoLabel = '';
		this._isPermanent = false;
	}
}

module Alert {
	export interface Getters extends PersistentModel.Getters {
		(key:'message'):string;
		(key:'command'):CommandManager.ICommand;
		(key:'commitLabel'):string;
		(key:'undoLabel'):string;
		(key:'isPermanent'):boolean;
		(key:'id'):number;
	}

	export interface Setters extends PersistentModel.Setters {
		(key:'message', message:string):void;
		(key:'command', command:CommandManager.ICommand):void;
		(key:'commitLabel', commitLabel:string):void;
		(key:'undoLabel', undoLabel:string):void;
		(key:'isPermanent', isPermanent:boolean):void;
		(key:'id', id:number):void;
	}
}

Alert.setDefaultApp('app/main');
Alert.setDefaultStore(<any> new (<any> declare([ Memory, Trackable ]))({}));

export = Alert;
