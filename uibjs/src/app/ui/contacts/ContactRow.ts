import binding = require('mayhem/binding/interfaces');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');

import Avatar = require('../Avatar');
import Contact = require('../../models/Contact');
import eTypeAdapter = require('../../models/adapters/eType');
import SelectionManager = require('../../viewModels/SelectionManager');
import TooltipLabel = require('../TooltipLabel');

class ContactRow extends SingleNodeWidget {
	get:ContactRow.Getters;
	set:ContactRow.Setters;

	_node:HTMLDivElement;

	protected _avatar:Avatar;
	protected _bindingHandles:IHandle[];
	protected _connectionTypesNode:HTMLSpanElement;
	protected _model:SelectionManager.SelectableProxy<Contact>;
	protected _tooltipLabel:TooltipLabel;

	_isAttachedSetter(value:boolean) {
		this._avatar.set('isAttached', value);
		this._tooltipLabel.set('isAttached', value);
		this._isAttached = value;
	}

	_initialize() {
		super._initialize();
		this._bindingHandles = [];
	}

	destroy() {
		super.destroy();
		this._avatar.destroy();
		this._tooltipLabel.destroy();
		this.set('model', undefined);
		this._bindingHandles.forEach(function (handle:IHandle) {
			handle.remove();
		});
	}

	_renderIdentifierNode():HTMLSpanElement {
		this._tooltipLabel = new TooltipLabel({
			app: this.get('app'),
			text: this._model.get('displayName'),
			parent: this
		});
		var spanNode = <HTMLSpanElement> this._tooltipLabel.detach();
		spanNode.classList.add('identifier');

		return spanNode;
	}

	_renderConnectionTypesNode():HTMLSpanElement {
		// Need to cast to any since TypeScript has no way of knowing how Proxy resolves get
		var contact = <any> this._model;
		var connectionTypesNode = document.createElement('span');

		if (contact.get('connectionTypes')) {
			connectionTypesNode.classList.add('connection-types');
			contact.get('connectionTypes').forEach(function (connectionType:string) {
				var connectionTypeNode = document.createElement('span');
				connectionTypeNode.classList.add('connection-' + eTypeAdapter.toConnectionType(connectionType));
				connectionTypesNode.appendChild(connectionTypeNode);
			});
		}
		this._connectionTypesNode = connectionTypesNode;
		return connectionTypesNode;
	}

	_registerBindings():void {
		var self:ContactRow = this;
		var app = this.get('app');
		var binder = app.get('binder');

		this._bindingHandles.push(binder.bind({
			source: this,
			sourcePath: 'model.image',
			target: this,
			targetPath: 'avatar.image'
		}));

		this._bindingHandles.push(binder.createBinding(this, 'model.displayName')
			.observe(function (change:binding.IChangeRecord<any>):void {
				self._tooltipLabel.set('text', change.value);
			})
		);

		this._bindingHandles.push(binder.createBinding(this, 'model.connectionTypes')
			.observe(function (change:binding.IChangeRecord<any>):void {
				self._node.removeChild(self._connectionTypesNode);
				self._node.appendChild(self._renderConnectionTypesNode());
			})
		);

		this._bindingHandles.push(binder.createBinding(this, 'model.isSelected')
			.observe(function (change:binding.IChangeRecord<any>):void {
				self._node.classList.toggle('selected', change.value);
			})
		);
	}

	_render():void {
		var model = this.get('model');

		this._avatar = new Avatar({
			image: model.get('image'),
			parent: this
		});

		this._node = document.createElement('div');
		this._node.appendChild(this._avatar.detach());
		this._node.appendChild(this._renderIdentifierNode());
		this._node.appendChild(this._renderConnectionTypesNode());

		this._node.className = 'ContactRow SelectableItem';

		if (model.get('isSelected')) {
			this._node.classList.add('selected');
		}

		this._registerBindings();
	}
}

module ContactRow {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'model'):SelectionManager.SelectableProxy<Contact>;
		(key:'firstNode'):HTMLDivElement;
		(key:'lastNode'):HTMLDivElement;
	};

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'model', model:SelectionManager.SelectableProxy<Contact>):void;
	};
}

export = ContactRow;
