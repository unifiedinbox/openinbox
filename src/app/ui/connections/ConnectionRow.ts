import binding = require('mayhem/binding/interfaces');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import Avatar = require('../Avatar');
import Connection = require('../../models/Connection');
import SelectionManager = require('../../viewModels/SelectionManager');
import TooltipLabel = require('../TooltipLabel');

class ConnectionRow extends SingleNodeWidget {
	get:ConnectionRow.Getters;
	set:ConnectionRow.Setters;

	_node:HTMLDivElement;

	protected _avatar:Avatar;
	protected _bindingHandles:IHandle[];
	protected _forwardConnectionType:boolean;
	protected _model:SelectionManager.SelectableProxy<Connection>;
	protected _tooltipLabel:TooltipLabel;

	_isAttachedSetter(value:boolean) {
		this._avatar.set('isAttached', value);
		this._tooltipLabel.set('isAttached', value);
		this._isAttached = value;
	}

	_initialize() {
		super._initialize();
		this._forwardConnectionType = false;
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

	_registerBindings():void {
		var self = this;
		var app = this.get('app');
		var binder = app.get('binder');

		if (this._forwardConnectionType) {
			this._bindingHandles.push(binder.bind({
				source: this,
				sourcePath: 'model.type',
				target: this,
				targetPath: 'avatar.connectionType'
			}));
		}

		this._bindingHandles.push(binder.createBinding(this, 'model.displayName')
			.observe(function (change:binding.IChangeRecord<any>):void {
				self._tooltipLabel.set('text', change.value);
			})
		);

		this._bindingHandles.push(binder.createBinding(this, 'model.isSelected')
			.observe(function (change:binding.IChangeRecord<any>):void {
				self._node.classList.toggle('selected', change.value);
			})
		);
	}

	_render():void {
		this._avatar = new Avatar({
			image: '',
			parent: this
		});

		this._node = document.createElement('div');
		this._node.appendChild(this._avatar.detach());
		this._node.appendChild(this._renderIdentifierNode());

		// TODO: update classname / styles
		this._node.className = 'ContactRow';
		this._registerBindings();
	}
}

module ConnectionRow {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'model'):SelectionManager.SelectableProxy<Connection>;
		(key:'firstNode'):HTMLDivElement;
		(key:'lastNode'):HTMLDivElement;
	};

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'model', model:SelectionManager.SelectableProxy<Connection>):void;
	};
}

export = ConnectionRow;
