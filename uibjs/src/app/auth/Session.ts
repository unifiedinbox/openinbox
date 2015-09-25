import declare = require('dojo/_base/declare');
import Memory = require('dstore/Memory');
import Observable = require('mayhem/Observable');
import RecentlyUsedFolder = require('../models/RecentlyUsedFolder');
import Trackable = require('dstore/Trackable');
import User = require('./User');

interface FolderInfo {
	id:number;
	lastUsedDate:number;
}

class Session extends Observable {
	get:Session.Getters;
	set:Session.Setters;

	/*
	 * Quote data obtained from the login service, used for loading dialog
	 */
	// TODO: this probably isn't the greatest place to put this, but we won't get it again if
	// the user revists the UI but is already logged in.
	protected _quote:User.IQuote;
	protected _recentlyUsedFolders:dstore.ISyncCollection<RecentlyUsedFolder>;
	protected _userId:number;
	protected _storageKeyPrefix:string;

	_storageKeyGetter():string {
		return this.get('storageKeyPrefix') + this.get('userId');
	}

	_initialize():void {
		super._initialize();
		this._recentlyUsedFolders = <any> new (<any> declare([ Memory, Trackable ]))({}).sort('lastUsedDate', true);
		this._userId = 0;
		this._storageKeyPrefix = 'uib-session-';
		this.deserialize();

		var self:Session = this;
		window.onunload = function () {
			self.serialize();
		};
	}

	protected _prepareFolderInfoForSerialization():FolderInfo[] {
		var folders:FolderInfo[] = [];
		this._recentlyUsedFolders.fetchSync().forEach(function (folder:RecentlyUsedFolder) {
			folders.push({
				id: folder.get('id'),
				lastUsedDate: folder.get('lastUsedDate')
			});
		});
		return folders;
	}

	protected _deserializeRecentlyUsedFolders(folders:FolderInfo[]):void {
		var self:Session = this;
		folders.forEach(function (folder:FolderInfo) {
			self._recentlyUsedFolders.put(new RecentlyUsedFolder({
				id: folder.id,
				lastUsedDate: folder.lastUsedDate
			}));
		});
	}

	serialize():void {
		var data = {
			recentlyUsedFolders: this._prepareFolderInfoForSerialization()
		};
		localStorage.setItem(this.get('storageKey'), JSON.stringify(data));
	}

	deserialize():void {
		var data = JSON.parse(localStorage.getItem(this.get('storageKey')));
		if (data && data.recentlyUsedFolders) {
			this._deserializeRecentlyUsedFolders(data.recentlyUsedFolders);
		}
	}
}

module Session {
	export interface Getters extends Observable.Getters {
		(key:'quote'):User.IQuote;
		(key:'recentlyUsedFolders'):dstore.ISyncCollection<RecentlyUsedFolder>;
		(key:'storageKey'):string;
		(key:'storageKeyPrefix'):string;
		(key:'userId'):number;
	};

	export interface Setters extends Observable.Setters {
		(key:'quote', value:User.IQuote):void;
		(key:'recentlyUsedFolders', recentlyUsedFolders:dstore.ISyncCollection<RecentlyUsedFolder>):void;
		(key:'storageKeyPrefix', value:string):void;
		(key:'userId', value:number):void;
	};
}

export = Session;
