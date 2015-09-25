import declare = require('dojo/_base/declare');
import Memory = require('dstore/Memory');
import Trackable = require('dstore/Trackable');
import PersistentModel = require('mayhem/data/PersistentModel');
import Contact = require('./Contact');

var TrackableMemory = declare([ Memory, Trackable ]);

class Comment extends PersistentModel {
	get:Comment.Getters;
	set:Comment.Setters;

	protected _date:Date;
	protected _message:string;

	_initialize():void {
		super._initialize();

		this._date = new Date();
		this._message = '';
	}
}

module Comment {
	export interface Getters extends PersistentModel.Getters {
		(key:'contact'):Contact;
		(key:'date'):Date;
		(key:'id'):number;
		(key:'message'):string;
	};

	export interface Setters extends PersistentModel.Setters {
		(key:'contact', value:Contact):void;
		(key:'date', value:Date):void;
		(key:'id', value:number):void;
		(key:'message', value:string):void;
	};
}

Comment.setDefaultApp('app/main');
Comment.setDefaultStore(<any> new TrackableMemory());

export = Comment;
