import Observable = require('mayhem/Observable');

class Loading extends Observable {
	get:Loading.Getters;
	set:Loading.Setters;

	protected _author:string;
	protected _message:string;

	_initialize() {
		super._initialize();
		this._author = '';
		this._message = '';
	}
}

module Loading {
	export interface Getters extends Observable.Getters {
		(key:'author'):string;
		(key:'message'):string;
	}

	export interface Setters extends Observable.Setters {
		(key:'isActionsVisible', value:boolean):void;
		(key:'isSidebarVisible', value:boolean):void;
	}
}

export = Loading;
