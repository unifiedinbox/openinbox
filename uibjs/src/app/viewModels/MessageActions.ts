import lang = require('dojo/_base/lang');
import Message = require('../models/Message');
import Observable = require('mayhem/Observable');

interface IMarkAsAction {
	iconClass:string;
	property:string;
	displayCondition:boolean;
	value?:boolean;
	text?:string;
}

var markAsActions:{ [key:string]:IMarkAsAction; } = {
	read: {
		iconClass: 'icon-app-read',
		property: 'isRead',
		displayCondition: false
	},

	unread: {
		iconClass: 'icon-app-unread',
		property: 'isRead',
		displayCondition: true
	},

	junk: {
		iconClass: 'icon-app-spam-shield',
		property: 'isJunk',
		displayCondition: false
	},

	notJunk: {
		iconClass: 'icon-app-spam-shield',
		property: 'isJunk',
		displayCondition: true
	},

	blacklist: {
		iconClass: 'icon-app-remove',
		property: 'isBlacklisted',
		displayCondition: false
	},

	whitelist: {
		iconClass: 'icon-app-whitelist',
		property: 'isBlacklisted',
		displayCondition: true
	}
};

class MessageActionsViewModel extends Observable {
	static getDefaultExcludedFolders(folders?:string[]):string[] {
		var defaults:string[] = [ 'Drafts', 'Outbox', 'Sent', 'Archive' ];
		var excluded:string[] = [];

		if (folders) {
			folders.forEach(function (folder:string):void {
				if (defaults.indexOf(folder) === -1) {
					excluded.push(folder);
				}
			});
		}

		return excluded.concat(defaults);
	}

	get:MessageActionsViewModel.Getters;
	set:MessageActionsViewModel.Setters;

	protected _currentFolderName:string;
	_currentFolderNameGetter():string {
		return this._currentFolderName;
	}
	_currentFolderNameSetter(value:string):void {
		this._currentFolderName = value;

		this.set('excludedFolders',
			MessageActionsViewModel.getDefaultExcludedFolders(value && [ value ]));
	}

	protected _excludedFolders:string[];
	protected hideArchive:boolean;
	protected hideFolders:boolean;
	protected hideMarkAs:boolean;
	protected hideDistribute:boolean;
	protected hideMore:boolean;

	// This is essentially a hack that forces child drop downs to close when the widget is hidden/displayed.
	protected _isChildOpen:boolean;
	_isChildOpenDependencies():string[] {
		return [ 'isOpen' ];
	}
	_isChildOpenGetter():boolean {
		return false;
	}

	protected _isOpen:boolean;
	protected _message:Message;

	protected _markAsActions:string[];
	_markAsActionsDependencies():string[] {
		return [ 'message' ];
	}
	_markAsActionsGetter():IMarkAsAction[] {
		var actions = this._markAsActions;
		var app = <any> this.get('app');
		var messages = app && (<any> app.get('i18n')).get('messages');
		var model = this._message;

		var mapped = actions && actions.reduce(function (actions:IMarkAsAction[], name:string):IMarkAsAction[] {
			var action = markAsActions[name];

			if (
				(name in markAsActions) &&
				(!model || (<any> model.get(action.property)) === action.displayCondition)
			) {
				var message = messages && messages[name];

				if (typeof message === 'function') {
					var object = <IMarkAsAction> lang.mixin({}, action);
					object.value = !object.displayCondition;
					object.text = message();

					actions.push(object);
				}
			}

			return actions;
		}, []);

		return mapped;
	}
	_markAsActionsSetter(value:string[]):void {
		this._markAsActions = value;
	}

	_stateClassesDependencies():string[] {
		return [ 'isOpen' ];
	}
	_stateClassesGetter():string {
		return !this._isOpen ? 'is-hidden' : '';
	}

	_initialize():void {
		this.set({
			excludedFolders: MessageActionsViewModel.getDefaultExcludedFolders(),
			hideArchive: false,
			hideFolders: false,
			hideMarkAs: false,
			hideDistribute: false,
			hideMore: false,
			isOpen: false,
			markAsActions: [ 'read', 'unread', 'junk', 'notJunk', 'blacklist', 'whitelist' ]
		});
	}
}

module MessageActionsViewModel {
	export interface Getters extends Observable.Getters {
		(key:'currentFolderName'):string;
		(key:'excludedFolders'):string[];
		(key:'isChildOpen'):boolean;
		(key:'isOpen'):boolean;
		(key:'folderSearch'):string;
		(key:'markAsActions'):IMarkAsAction[];
		(key:'message'):Message;
		(key:'stateClasses'):string;
	}

	export interface Setters extends Observable.Setters {
		(key:'currentFolderName', value:string):void;
		(key:'excludedFolders', value:string[]):void;
		(key:'isOpen', value:boolean):void;
		(key:'folderSearch', value:string):void;
		(key:'markAsActions', value:string[]):void;
		(key:'message', value:Message):void;
	}
}

export = MessageActionsViewModel;
