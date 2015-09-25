import bindings = require('mayhem/binding/interfaces');
import data = require('mayhem/data/interfaces');
import domClass = require('dojo/dom-class');
import Event = require('mayhem/Event');
import Folder = require('../../models/Folder');
import FolderRow = require('./FolderRow');
import FolderProxy = require('../../viewModels/FolderList');
import ListView = require('mayhem/ui/dom/ListView');
import RecentlyUsedFolder = require('../../models/RecentlyUsedFolder');
import SearchWidget = require('../search/SearchWidget');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import TextWidget = require('mayhem/ui/form/Text');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');

class FolderList extends SearchWidget {
	get:FolderList.Getters;
	set:FolderList.Setters;

	// TODO: `_node` is public in SingleNodeWidget - switch to protected when it does
	_node:HTMLElement;

	protected _collection:dstore.ICollection<data.IProxyModel<Folder>>;
	_collectionGetter():dstore.ICollection<data.IProxyModel<Folder>> {
		return this._collection;
	}
	_collectionSetter(value:dstore.ICollection<Folder>):void {
		if (value) {
			this._collection = <any> FolderProxy.forCollection(value);

			this._setMainListCollection();
			this._setArchiveListCollection();

			this._currentFolderHandle && this._currentFolderHandle.remove();
			this._currentFolderHandle = this.get('app').get('binder').createBinding(this, 'currentFolderId')
				.observe((change:bindings.IChangeRecord<number>):void => {
					var currentFolderId = change.value;

					if (typeof currentFolderId === 'number') {
						this._collection.forEach(function (folder:Folder):void {
							folder.set('isHighlighted', (<any> folder.get('id') === currentFolderId));
						});
					}
				});
		}
	}

	protected _containerClass:string;
	protected _currentFolderHandle:IHandle;
	protected _currentFolderId:number;

	protected _excluded:string[];
	_excludedGetter():string[] {
		return this._excluded && this._excluded.slice();
	}
	_excludedSetter(value:string[]):void {
		this._excluded = value;

		if (value && this._collection) {
			this._setMainListCollection();
		}
	}

	protected _groupNode:HTMLElement;
	protected _listClass:string;
	protected _value:string;
	protected _showUnreadCount:boolean;
	protected _showRecentlyUsed:boolean;
	protected _showArchives:boolean;
	protected _mainList:ListView<Folder>;

	protected _recentlyUsedFoldersHandle:IHandle;
	protected _recentlyUsedFolders:dstore.ICollection<RecentlyUsedFolder>;
	_recentlyUsedFoldersGetter():dstore.ICollection<RecentlyUsedFolder> {
		return this._recentlyUsedFolders;
	}
	_recentlyUsedFoldersSetter(value:dstore.ICollection<RecentlyUsedFolder>):void {
		this._recentlyUsedFolders = value;
		this._recentlyUsedFoldersHandle && this._recentlyUsedFoldersHandle.remove();

		if (value) {
			this._recentlyUsedFoldersHandle = value.on('add,update,delete', ():void => {
				this._setRecentlyUsedListCollection();
			});

			this._setRecentlyUsedListCollection();
		}
	}

	protected _recentlyUsedList:ListView<Folder>;
	protected _archiveList:ListView<Folder>;
	protected _searchInputWidget:TextWidget;

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean):void {
		super._isAttachedSetter(value);

		this._mainList.set('isAttached', value);
		this._recentlyUsedList && this._recentlyUsedList.set('isAttached', value);
		this._archiveList && this._archiveList.set('isAttached', value);
	}

	_searchSetter(search:string):void {
		if (this._isAttached && this._collection) {
			this._searchInputWidget.set('value', search);
			this._setMainListCollection(search);

			if (this._archiveList) {
				this._setArchiveListCollection(search);
			}

			if (this._recentlyUsedList) {
				domClass.toggle(this._recentlyUsedList.get('firstNode'), 'is-hidden', !!search);
			}
		}

		this._search = search;
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection', 'recentlyUsedFolders', 'search' ], '_render');
		super(kwArgs);
	}

	destroy() {
		super.destroy();

		this._mainList.destroy();
		this._recentlyUsedList && this._recentlyUsedList.destroy();
		this._archiveList && this._archiveList.destroy();
		this._currentFolderHandle && this._currentFolderHandle.remove();
		this._recentlyUsedFoldersHandle && this._recentlyUsedFoldersHandle.remove();
	}

	_initialize() {
		super._initialize();
		this._excluded = [];
		this._value = '';
		this._showUnreadCount = true;
		this._showRecentlyUsed = false;
		this._showArchives = false;
		this._containerClass = '';
		this._listClass = '';
	}

	_render() {
		this._node = document.createElement('div');
		domClass.add(this._node, 'FolderListContainer');
		this._groupNode = document.createElement('div');
		this._groupNode.className = 'FolderList-group';

		if (this._containerClass) {
			domClass.add(this._node, this._containerClass);
		}

		// TODO: Are both `this._showRecentlyUsed` and `this._recentlyUsedFolders` necessary? On the one hand,
		// if no collection is provided, then the list will not be displayed. On the other hand, without the
		// former, the list will be in the DOM regardless of whether a collection was provided.
		if (this._showRecentlyUsed) {
			this._recentlyUsedList = this._createListView(false);
			domClass.add(this._recentlyUsedList.get('firstNode'), 'FolderList--recentlyUsed');
		}

		this._mainList = this._createListView(true);

		if (this._showArchives) {
			this._archiveList = this._createListView(false);
			domClass.add(this._archiveList.get('firstNode'), 'FolderList--archives');
		}

		this._node.appendChild(this._groupNode);
		this._registerEvents();
	}

	protected _setRecentlyUsedListCollection(search?:string):void {
		var listView = this._recentlyUsedList;
		var collection = this._recentlyUsedFolders;
		var self = this;

		if (listView) {
			RecentlyUsedFolder.getFolders(collection).then(function (folders:dstore.ICollection<Folder>):void {
				listView.set('collection', folders);
				self._setListStateClass(<HTMLElement> listView.get('firstNode'), folders);
			});
		}
	}

	protected _setMainListCollection(search?:string):void {
		var listView = this._mainList;
		var collection = (<any> this._collection).exclude([ 'Archive' ], 'parentFolder')
			.exclude(this._excluded, 'name');

		if (search && search.length) {
			collection = this._filterSearchResults(collection, search);
		}

		listView.set('collection', collection);
		this._setListStateClass(<HTMLElement> listView.get('firstNode'), collection);
	}

	protected _setArchiveListCollection(search?:string):void {
		var listView = this._archiveList;

		if (listView) {
			var collection = (<any> this._collection).include([ 'Archive' ], 'parentFolder');

			if (search && search.length) {
				collection = this._filterSearchResults(collection, search);
			}

			listView.set('collection', collection);
			this._setListStateClass(<HTMLElement> listView.get('firstNode'), collection);
		}
	}

	protected _filterSearchResults(collection:dstore.ICollection<Folder>, search:string):dstore.ICollection<Folder> {
		var pattern = new RegExp(search, 'i');

		return collection.filter(function (folder:Folder):boolean {
			return pattern.test(folder.get('name'));
		});
	}

	protected _setListStateClass(node:HTMLElement, collection:dstore.ICollection<Folder>):void {
		collection.fetch().then(function (folders:Folder[]):void {
			domClass.toggle(node, 'is-empty', !folders.length);
		});
	}

	protected _createListView(showUnreadCount:boolean = true):ListView<Folder> {
		var listViewNode:HTMLElement;
		var listView = <ListView<Folder>> new ListView({
			app: this.get('app'),
			itemConstructor: FolderRow,
			parent: this,
			sort: 'name'
		});

		listViewNode = <HTMLElement> listView.detach();

		domClass.add(listViewNode, 'dgrid-autoheight FolderList');

		if (this._listClass) {
			domClass.add(listViewNode, this._listClass);
		}

		if (!showUnreadCount || !this._showUnreadCount) {
			domClass.add(listViewNode, 'is-unreadCountHidden');
		}

		this._groupNode.appendChild(listViewNode);

		return listView;
	}

	protected _registerEvents():void {
		this.on('activate', (event:ui.ClickEvent):void => {
			var target = <any> event.target;

			if (target instanceof FolderRow) {
				this.emit(new Event({
					type: 'folderSelected',
					bubbles: true,
					cancelable: false,
					target: target
				}));
			}
		});
	}
}

module FolderList {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'collection'):dstore.ICollection<data.IProxyModel<Folder>>;
		(key:'containerClass'):string;
		(key:'currentFolderId'):number;
		(key:'excluded'):string[];
		(key:'firstNode'):HTMLElement;
		(key:'lastNode'):HTMLElement;
		(key:'listClass'):string;
		(key:'recentlyUsedFolders'):dstore.ICollection<RecentlyUsedFolder>;
		(key:'showArchives'):boolean;
		(key:'showRecentlyUsed'):boolean;
		(key:'showUnreadCount'):boolean;
	};

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'collection', value:dstore.ICollection<Folder>):void;
		(key:'containerClass', value:string):void;
		(key:'currentFolderId', value:number):void;
		(key:'excluded', value:string[]):void;
		(key:'listClass', value:string):void;
		(key:'recentlyUsedFolders', value:dstore.ICollection<RecentlyUsedFolder>):void;
		(key:'showArchives', value:boolean):void;
		(key:'showRecentlyUsed', value:boolean):void;
		(key:'showUnreadCount', value:boolean):void;
	};
}

export = FolderList;
