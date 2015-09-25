import Model = require('mayhem/data/Model');
import Folder = require('./Folder');
import WebApplication = require('mayhem/WebApplication');

class RecentlyUsedFolder extends Model {
	get:RecentlyUsedFolder.Getters;
	set:RecentlyUsedFolder.Setters;

	/**
	 * Since `RecentlyUsedFolder` only stores the Folder's idProperty value and last date of use,
	 * we need a way to map the name back to a sorted list of actual Folder objects. `getFolders`
	 * returns a collection of Folder objects sorted newest-to-oldest by the `lastUsedDate` on the
	 * corresponding `RecentlyUsedFolder` object.
	 *
	 * @param {dstore.ICollection<RecentlyUsedFolder>} collection A collection of recently used folders.
	 * @param number limit The maximum number of folders to retrieve.
	 * @return Promise<dstore.ICollection<Folder>> A promise to the sorted collection of `Folder` objects.
	 */
	static getFolders(collection:dstore.ICollection<RecentlyUsedFolder>, limit:number = 3):IPromise<dstore.ICollection<Folder>> {
		return collection.fetchRange({
			start: 0,
			end: limit
		}).then(function (folders:RecentlyUsedFolder[]):IPromise<dstore.ICollection<Folder>> {
			var folderIds:number[] = [];
			var dates:HashMap<number> = {};

			folders.forEach(function (folder:RecentlyUsedFolder):void {
				var id:number = folder.get('id');

				folderIds.push(id);
				dates[id] = folder.get('lastUsedDate');
			});

			return (<any> Folder.store).include(folderIds).sort(function (left:Folder, right:Folder):number {
				var leftId:number = left.get('id');
				var rightId:number = right.get('id');

				return dates[leftId] < dates[rightId] ? 1 : -1;
			});
		});
	}

	_app:WebApplication;
	_id:number;
	_lastUsedDate:number;

	_initialize():void {
		super._initialize();
		this._lastUsedDate = Number(new Date());
	}
}

module RecentlyUsedFolder {
	export interface Getters extends Model.Getters {
		(key:'id'):number;
		(key:'lastUsedDate'):number;
	}

	export interface Setters extends Model.Setters {
		(key:'id', value:number):void;
		(key:'lastUsedDate', value:number):void;
	}
}

RecentlyUsedFolder.setDefaultApp('app/main');

export = RecentlyUsedFolder;
