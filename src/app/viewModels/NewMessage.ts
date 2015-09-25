import Attachment = require('../models/Attachment');
import AttachmentsViewModel = require('./Attachments');
import data = require('mayhem/data/interfaces');
import Folder = require('../models/Folder');
import Message = require('../models/Message');
import Proxy = require('mayhem/data/Proxy');
import TrackableMemory = require('../models/stores/TrackableMemory');

var LOCALSTORAGE_KEY = 'uib-messagecomposition-';

class NewMessage extends Proxy<Message> {
	get:NewMessage.Getters;
	set:NewMessage.Setters;

	protected _attachmentsModel:AttachmentsViewModel;
	_attachmentsModelGetter():AttachmentsViewModel {
		return this._attachmentsModel;
	}
	_attachmentsModelSetter(value:AttachmentsViewModel):void {
		this._attachmentsModel = value;
		this._attachmentsHandle && this._attachmentsHandle.remove();

		if (value) {
			var attachments:dstore.ICollection<data.IProxyModel<Attachment>> = <any> value.get('attachments');
			var self = this;
			this._attachmentsHandle = attachments.on('add,delete',
				function (event:dstore.ChangeEvent<Attachment>):void {
					if (event.type === 'add') {
						self.set('hasAttachment', true);
					}
					else {
						attachments.fetch().then(function (items:Attachment[]):void {
							self.set('hasAttachment', Boolean(items.length));
						});
					}
				});
		}
	}

	protected _attachmentsHandle:IHandle;

	protected _selectedFolder:Folder;
	_selectedFolderGetter():Folder {
		return this._selectedFolder;
	}
	_selectedFolderSetter(selectedFolder:Folder):void {
		this._selectedFolder = selectedFolder;

		if (selectedFolder) {
			localStorage.setItem(LOCALSTORAGE_KEY + 'selectedFolder', selectedFolder.get('name'));
		}
	}

	protected _selectedFolderLabel:string;
	_selectedFolderLabelDependencies():string[] {
		return [ 'selectedFolder' ];
	}
	_selectedFolderLabelGetter():string {
		var app = this.get('app');
		var folderName:string = this._selectedFolder && this._selectedFolder.get('name');

		if (!folderName) {
			folderName = localStorage.getItem(LOCALSTORAGE_KEY + 'selectedFolder');

			if (!folderName && app) {
				folderName = (<any> app).get('i18n').get('messages').archive();
			}

			Folder.store.filter({ name: folderName }).fetch().then((folders:Folder[]):void => {
				this._selectedFolder = folders[0];
			});
		}

		this._selectedFolderLabel = folderName;
		return this._selectedFolderLabel;
	}

	destroy():void {
		super.destroy();

		this._attachmentsHandle && this._attachmentsHandle.remove();
	}

	_initialize():void {
		super._initialize();

		this.set({
			attachmentsModel: new AttachmentsViewModel({
				attachments: new TrackableMemory({
					idProperty: 'name'
				})
			}),
			compositionAction: '',
			isOpen: false,
			moveToFolder: false,
			selectedFolder: null
		});
	}
}

module NewMessage {
	export interface Getters extends Message.Getters, Proxy.Getters {
		(key:'attachmentsModel'):AttachmentsViewModel;
		(key:'compositionAction'):string;
		(key:'isOpen'):boolean;
		(key:'moveToFolder'):boolean;
		(key:'selectedFolder'):Folder;
		(key:'selectedFolderLabel'):string;
		(key:'source'):Message;
	}

	export interface Setters extends Message.Setters, Proxy.Setters {
		(key:'attachmentsModel', value:AttachmentsViewModel):void;
		(key:'compositionAction', value:string):void;
		(key:'isOpen', isOpen:boolean):void;
		(key:'moveToFolder', moveToFolder:boolean):void;
		(key:'selectedFolder', selectedFolder:Folder):void;
		(key:'source', value:Message):void;
	}
}

export = NewMessage;
