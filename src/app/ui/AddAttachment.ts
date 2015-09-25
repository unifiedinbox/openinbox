import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import domConstruct = require('dojo/dom-construct');
import Memory = require('dstore/Memory');
import on = require('dojo/on');
// TODO: I'd prefer referencing the individual ViewModel here but I'm not sure how to best expose it
import Attachment = require('../models/Attachment');

class AddAttachment extends SingleNodeWidget {
	_node:HTMLElement;
	protected _inputNode:HTMLInputElement;
	protected _labelNode:HTMLElement;
	protected _collection:dstore.ICollection<Attachment>;

	_initialize():void {
		super._initialize();
		this._collection = new Memory<Attachment>({});
	}

	_render():void {
		var node = this._node = document.createElement('div');
		node.className = 'AddAttachment';

		this._labelNode = <HTMLElement> domConstruct.create('span', {
			className: 'Attachments-label icon-app-attachment'
		}, node);

		var inputNode = this._inputNode = <HTMLInputElement> domConstruct.create('input', {
			className: 'Attachments-input',
			type: 'file',
			multiple: true
		}, node);
		on(inputNode, 'change', this._onFileChange.bind(this));
	}

	destroy() {
		super.destroy();

		// TODO: Ultimately this should move to Message widget / model
		this._collection.forEach(function (attachment:Attachment) {
			var previewUrl = attachment.get('previewUrl');
			if (previewUrl.indexOf('blob:') === 0) {
				URL.revokeObjectURL(previewUrl);
			}
			attachment.remove();
			attachment.destroy();
		});
	}

	_onFileChange(event:Event):void {
		var files = (<HTMLInputElement> event.target).files;

		for (var i = 0, length = files.length; i < length; i++) {
			var file = files[i];

			// TODO: technically dstore will instantiate Attachment if we don't here,
			// but tsc complains without it
			this._collection.add(new Attachment({
				app: this.get('app'),
				store: this._collection,
				name: file.name,
				type: file.type,
				size: file.size,
				previewUrl: this._generatePreviewUrl(file)
			}));
		}
		this._inputNode.value = '';
	}

	_generatePreviewUrl(file:File):string {
		if (file.type.indexOf('image/') !== -1) {
			return URL.createObjectURL(file);
		}
		return '';
	}
}

module AddAttachment {
	export interface Getters extends SingleNodeWidget.Getters {
		// Override first/lastNode getters to match _node
		(key:'collection'):dstore.ICollection<Attachment>;
		(key:'firstNode'):HTMLElement;
		(key:'lastNode'):HTMLElement;
	}

	export interface Setters extends SingleNodeWidget.Setters {
	}
}

export = AddAttachment;
