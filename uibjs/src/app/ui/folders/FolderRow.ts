import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import Model = require('mayhem/data/Model');
import domConstruct = require('dojo/dom-construct');
import domClass = require('dojo/dom-class');
import binding = require('mayhem/binding/interfaces');
import util = require('../../util');

class FolderRow extends SingleNodeWidget {
	get:FolderRow.Getters;
	set:FolderRow.Setters;

	_node:HTMLDivElement;

	protected _nameNode:HTMLAnchorElement;
	protected _unreadCountNode:HTMLSpanElement;
	protected _unreadCountTextNode:Text;
	protected _bindingHandles:IHandle[];

	_initialize() {
		super._initialize();
		this._bindingHandles = [];
	}

	destroy() {
		super.destroy();
		this.set('model', null);
		this._bindingHandles.forEach(function (handle:IHandle):void {
			handle.remove();
		});
	}

	_render() {
		this._node = domConstruct.create('div', {
			className: this._getClassName()
		});

		this._renderName();
		this._renderMessageCount();

		this._registerBindings();
	}

	protected _getClassName():string {
		var name:string = <any> this.get('model').get('name');
		var className = 'Folder Folder--' + util.toCamelCase(name);
		var model:Model = this.get('model');

		if (model.get('isHighlighted')) {
			className += ' is-highlighted';
		}

		if (model.get('type')) {
			className += ' Folder--' + model.get('type');
		}

		return className;
	}

	protected _renderName():void {
		var nameTextNode:Text = document.createTextNode(<any> this.get('model').get('name'));

		this._nameNode = <HTMLAnchorElement> domConstruct.create('a', {
			className: 'Folder-link'
		});

		this._nameNode.appendChild(nameTextNode);

		this._node.appendChild(this._nameNode);
	}

	protected _renderMessageCount():void {
		var count = Number(this.get('model').get('unreadMessageCount'));
		var className:string = 'Folder-unreadCount';

		if (!count) {
			className += ' is-hidden';
		}

		this._unreadCountNode = <HTMLSpanElement> domConstruct.create('span', {
			className: className
		});

		this._unreadCountTextNode = document.createTextNode(String(count));
		this._unreadCountNode.appendChild(this._unreadCountTextNode);
		this._node.appendChild(this._unreadCountNode);
	}

	protected _registerBindings():void {
		var app = this.get('app');
		var model = this.get('model');
		var binder = app.get('binder');
		var self = this;

		if (this._unreadCountTextNode) {
			this._bindingHandles.push(binder.createBinding(model, 'unreadMessageCount')
				.observe(function (change:binding.IChangeRecord<number>):void {
					self._unreadCountTextNode.nodeValue = String(change.value);
					domClass.toggle(self._unreadCountNode, 'is-hidden', change.value < 1);
				}));
		}

		this._bindingHandles.push(binder.createBinding(model, 'isHighlighted')
			.observe((change:binding.IChangeRecord<boolean>):void => {
				this._node.classList.toggle('is-highlighted', change.value);
			}));
	}
}

module FolderRow {
    export interface Getters extends SingleNodeWidget.Getters {
    	(key:'model'):Model;
    	// Override first/lastNode getters to match _node
    	(key:'firstNode'):HTMLElement;
    	(key:'lastNode'):HTMLElement;
    };

    export interface Setters extends SingleNodeWidget.Setters {};
}

export = FolderRow;
