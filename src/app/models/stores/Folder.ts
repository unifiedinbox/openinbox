import Folder = require('../Folder');
import declare = require('dojo/_base/declare');
import endpoints = require('../../endpoints');
import HeaderMixin = require('./HeaderMixin');
import request = require('dojo/request/registry');
import RequestMemory = require('./RequestMemory');
import _StoreFilters = require('./_StoreFilters');
import Trackable = require('dstore/Trackable');

interface IServiceFolder {
	childs?:IServiceFolder[];
	index:string;
	name:string;
	permissions:{
		delete:boolean;
		move:boolean;
		read:boolean;
		rename:boolean;
		write:boolean;
	}
	type:number;
	unreadMessageCount:number;
}

interface IFolderListResponse {
	response: {
		data: {
			UNIFIED: IServiceFolder[];
		}
	}[];
}

interface IRequest {
	data:IPromise<Folder[]>;
	total:IPromise<number>;
	response:IPromise<Folder[]>;
}

interface FolderStore extends RequestMemory<Folder>, HeaderMixin {};

var FolderStore = declare<FolderStore>([ RequestMemory, Trackable, HeaderMixin, _StoreFilters ], {

	Model: Folder,

	_restore: function (folder:IServiceFolder, parentFolder?:string):Folder {
		return new Folder({
			id: Number(folder.index),
			isDeletable: folder.permissions.delete,
			isMovable: folder.permissions.move,
			isReadable: folder.permissions.read,
			isRenamable: folder.permissions.rename,
			isWritable: folder.permissions.write,
			name: folder.name,
			parentFolder: parentFolder,
			type: folder.type,
			unreadMessageCount: folder.unreadMessageCount
		});
	},

	_request: function ():IRequest {
		var getFolderListRequest = request.post(endpoints.getAllFolders, {
			headers: this._getAppHeaders(),
			handleAs: 'json'
		});

		return {
			data: getFolderListRequest.then((response:IFolderListResponse) => {
				var results:Folder[] = [];

				response.response[0].data.UNIFIED.forEach((result:IServiceFolder) => {
					this._restoreFolder(results, result);
				});

				return results;
			}),

			total: getFolderListRequest.then((response:IFolderListResponse) => {
				return response.response[0].data.UNIFIED.length;
			}),

			response: (<any> getFolderListRequest).response
		};
	},

	_restoreFolder: function (folderList:Folder[], folder:IServiceFolder, parentFolder?:string):void {
		folderList.push(this._restore(folder, parentFolder));

		if (folder.childs && folder.childs.length) {
			for (var i = 0; i < folder.childs.length; i++) {
				this._restoreFolder(folderList, folder.childs[i], folder.name);
			}
		}
	}
});

Folder.setDefaultStore(new FolderStore({ app: 'app/main' }));

export = FolderStore;
