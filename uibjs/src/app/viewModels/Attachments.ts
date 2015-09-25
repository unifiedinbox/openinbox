import Observable = require('mayhem/Observable');
import Proxy = require('mayhem/data/Proxy');
import Attachment = require('../models/Attachment');
import AttachmentStore = require('../models/stores/Attachment');

// Hash mapping known extensions to associated CSS classes (sans "icon-app-file-" prefix)
// (some extensions do not always map to MIME types e.g. flac, so using extension is generally more reliable)
var sizeUnitKeys = [ 'b', 'kb', 'mb', 'gb', 'tb' ];

class AttachmentViewModel extends Observable {
	get:AttachmentViewModel.Getters;
	set:AttachmentViewModel.Setters;

	static fileExtensions:{ [key:string]:string } = {
		wav: 'audio',
		mp3: 'audio',
		wma: 'audio',
		aac: 'audio',
		m4a: 'audio',
		flac: 'audio',
		ogg: 'audio',
		xls: 'excel',
		xlsx: 'excel',
		numbers: 'excel',
		jpg: 'image',
		jpeg: 'image',
		png: 'image',
		gif: 'image',
		bmp: 'image',
		svg: 'image',
		ico: 'image',
		tif: 'image',
		tiff: 'image',
		pdf: 'pdf',
		ppt: 'powerpoint',
		pptx: 'powerpoint',
		keynote: 'powerpoint',
		avi: 'video',
		mp4: 'video',
		mov: 'video',
		ogv: 'video',
		mkv: 'video',
		flv: 'video',
		wmv: 'video',
		rm: 'video',
		m4v: 'video',
		'3gp': 'video',
		doc: 'word',
		docx: 'word',
		pages: 'word',
		zip: 'zip',
		rar: 'zip',
		'7z': 'zip'
	}

	protected _attachments:dstore.ICollection<AttachmentProxy>;
	_attachmentsGetter():dstore.ICollection<AttachmentProxy> {
		return this._attachments;
	}
	_attachmentsSetter(value:dstore.ICollection<Attachment>):void {
		this._collection = value;

		if (value) {
			this._attachments = <any> AttachmentProxy.forCollection(value);
		}
	}

	protected _collection:dstore.ICollection<Attachment>;

	delete(event:UIEvent):void {
		var attachment:AttachmentProxy = (<any> event.target).get('attachment');

		if (attachment) {
			this._collection.remove(attachment.get('name'));
		}
	}

	destroy():void {
		super.destroy();

		this._attachments = null;
		this._collection = null;
	}
}

class AttachmentProxy extends Proxy<Attachment> {
	get:AttachmentProxy.Getters;
	set:AttachmentProxy.Setters;

	/** Read-only property indicating default icon class used for unrecognized file extensions */
	protected _defaultIconClass = 'icon-app-template';

	_defaultIconClassGetter() {
		return this._defaultIconClass;
	}

	_iconClassDependencies() {
		return [ 'extension' ];
	}

	/** Returns a className that should be added by the Attachments widget */
	_iconClassGetter() {
		var suffix = AttachmentViewModel.fileExtensions[this.get('extension')];
		return suffix ? 'icon-app-file-' + suffix : this.get('defaultIconClass');
	}

	_readableSizeDependencies() {
		return [ 'size' ];
	}

	/**
	 * Returns filesize in a human-readable format, converting to higher units until
	 * a number under 1024 is obtained (or TB is reached)
	 */
	_readableSizeGetter() {
		var size = this.get('size');
		var length = sizeUnitKeys.length;
		var index = 0;
		while (size >= 1024 && index < length - 1) {
			size /= 1024;
			index++;
		}

		// TODO: number formatting
		var messages:any = (<any> this.get('app').get('i18n')).get('messages');
		return Math.round(size) + ' ' + messages[sizeUnitKeys[index]]();
	}

	_initialize():void {
		super._initialize();
	}
}

module AttachmentProxy {
	export interface Getters extends Attachment.Getters, Proxy.Getters {
		(key:'defaultIconClass'):string;
		(key:'iconClass'):string;
		(key:'readableSize'):string;
	}

	export interface Setters extends Attachment.Setters, Proxy.Setters {
	}
}

module AttachmentViewModel {
	export interface Getters extends Observable.Getters {
		(key:'attachments'):dstore.ICollection<AttachmentProxy>;
	}

	export interface Setters extends Observable.Setters {
		(key:'attachments', value:dstore.ICollection<AttachmentProxy>):void;
	}

	// Allow AttachmentProxy to be accessed from this module's returned constructor
	export var Proxy = AttachmentProxy;
	export type Proxy = AttachmentProxy;
}

export = AttachmentViewModel;
