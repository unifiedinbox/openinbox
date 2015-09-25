import Model = require('mayhem/data/Model');
import PersistentModel = require('mayhem/data/PersistentModel');

class Folder extends PersistentModel {
	get:Folder.Getters;
	set:Folder.Setters;

	/**
	 * Updates a folder's unread message count, depending on whether the message is marked as unread or read.
	 * If the message was moved from another folder, the old folder's id can be provided to also update
	 * its unread message count.
	 *
	 * @param Model message The message object with a string `folderId` property and boolean `isRead` property.
	 * @param {number} previous The id of the message's previous folder.
	 * @return Promise<Folder> A promise to the updated folder.
	 */
	static updateUnreadCount(message:Model, previous?:number):IPromise<Folder> {
		var id:number = Number(message.get('folderId'));

		if (typeof previous === 'number') {
			Folder.get(previous).then(function (folder:Folder):void {
				folder.updateUnreadCount(true);
			});
		}

		return Folder.get(id).then(function (folder:Folder):Folder {
			folder.updateUnreadCount(Boolean(message.get('isRead')));
			return folder;
		});
	}

	protected _isDeletable:boolean;
	protected _isMovable:boolean;
	protected _isReadable:boolean;
	protected _isRenamable:boolean;
	protected _isWritable:boolean;
	protected _name:string;
	protected _unreadMessageCount:number;
	protected _type:string;
	protected _parentFolder:string;

	_initialize():void {
		super._initialize();

		this._isDeletable = true;
		this._isMovable = true;
		this._isReadable = true;
		this._isRenamable = true;
		this._isWritable = true;
		this._name = '';
		this._type = '';
		this._parentFolder = '';
		this._unreadMessageCount = 0;
	}

	updateUnreadCount(isRead:boolean):void {
		var count:number = this._unreadMessageCount;
		this.set('unreadMessageCount', Math.max(0, count + (isRead ? -1 : 1)));
	}
}

module Folder {
	export interface Getters extends PersistentModel.Getters {
		(key:'id'):number;
		(key:'isDeletable'):boolean;
		(key:'isMovable'):boolean;
		(key:'isReadable'):boolean;
		(key:'isRenamable'):boolean;
		(key:'isWritable'):boolean;
		(key:'name'):string;
		(key:'parentFolder'):string;
		(key:'type'):string;
		(key:'unreadMessageCount'):number;
	}

	export interface Setters extends PersistentModel.Setters {
		(key:'id', value:number):void;
		(key:'isDeletable', value:boolean):void;
		(key:'isMovable', value:boolean):void;
		(key:'isReadable', value:boolean):void;
		(key:'isRenamable', value:boolean):void;
		(key:'isWritable', value:boolean):void;
		(key:'name', value:string):void;
		(key:'parentFolder', value:string):void;
		(key:'type', value:string):void;
		(key:'unreadMessageCount', value:number):void;
	}
}

Folder.setDefaultApp('app/main');
// setDefaultStore is called from the store module to avoid a circular dependency

export = Folder;
