import Folder = require('../models/Folder');
import Proxy = require('mayhem/data/Proxy');

class FolderProxy extends Proxy<Folder> {
	protected _isHighlighted:boolean;

	_initialize():void {
		super._initialize();

		this.set('isHighlighted', false);
	}
}

module FolderProxy {
	export interface Getters extends Folder.Getters, Proxy.Getters {
		(key:'isHighlighted'):boolean;
	}

	export interface Setters extends Folder.Setters, Proxy.Setters {
		(key:'isHighlighted', value:boolean):void;
	}
}

export = FolderProxy;
