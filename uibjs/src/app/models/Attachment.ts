import PersistentModel = require('mayhem/data/PersistentModel');

class Attachment extends PersistentModel {
	get:Attachment.Getters;
	set:Attachment.Setters;

	/** Filename of the attachment */
	protected _name:string;

	/** MIME type of the attachment */
	protected _type:string;

	/** Size (in bytes) of the attachment */
	protected _size:number;

	/** URL (whether data/object URL or server-generated) to an image preview of the attachment */
	protected _previewUrl:string;

	_initialize() {
		super._initialize();
		this._name = '';
		this._type = '';
		this._size = 0;
		this._previewUrl = '';
	}

	_extensionDependencies() {
		return [ 'name' ];
	}

	/** Returns the extension found on the attachment's filename, or empty string if none */
	_extensionGetter() {
		var name = this.get('name');
		var extensionIndex = name.lastIndexOf('.');
		return extensionIndex !== -1 ? name.slice(extensionIndex + 1) : '';
	}
}

module Attachment {
	export interface Getters extends PersistentModel.Getters {
		(key:'name'):string;
		(key:'type'):string;
		(key:'size'):number;
		(key:'previewUrl'):string;
		(key:'extension'):string;
	}

	export interface Setters extends PersistentModel.Setters {
		(key:'name', value:string):void;
		(key:'type', value:string):void;
		(key:'size', value:number):void;
		(key:'previewUrl', value:string):void;
	}
}

Attachment.setDefaultApp('app/main');
// setDefaultStore is called from the store module to avoid a circular dependency

export = Attachment;
