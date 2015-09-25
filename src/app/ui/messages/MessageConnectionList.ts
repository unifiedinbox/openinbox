import bindings = require('mayhem/binding/interfaces');
import Button = require('mayhem/ui/dom/form/Button');
import Connection = require('../../models/Connection');
import GroupedConnectionList = require('../connections/GroupedConnectionList');
import Event = require('mayhem/Event');
import SelectionManager = require('../../viewModels/SelectionManager');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');

interface ISelectable extends SelectionManager.SelectableProxy<Connection> {}

class MessageConnectionList extends SingleNodeWidget {
	get:MessageConnectionList.Getters;
	set:MessageConnectionList.Setters;

	protected _bindingHandles:IHandle[];

	protected _collection:dstore.ICollection<Connection>;
	_collectionGetter():dstore.ICollection<Connection> {
		return this._collection;
	}
	_collectionSetter(value:dstore.ICollection<Connection>):void {
		if (value) {
			this._collection = value;
			this._connectionList.set('collection', value);
		}
	}

	protected _connectionList:GroupedConnectionList;

	_isAttached:boolean;
	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean):void {
		this._isAttached = value;
		this._connectionList.set('isAttached', value);
		this._submitButton.set('isAttached', value);
	}

	_node:HTMLElement;
	protected _submitButton:Button;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection' ], '_render');
		super(kwArgs);
	}

	destroy():void {
		super.destroy();
		this._connectionList.destroy();
		this._submitButton.destroy();

		this._bindingHandles.forEach(function (handle:IHandle):void {
			handle.remove();
		});
	}

	_initialize():void {
		super._initialize();
		this._bindingHandles = [];
	}

	_render():void {
		var messages = (<any> this.get('app').get('i18n')).get('messages');
		var button = new Button({
			app: this.get('app'),
			parent: this,
			label: messages.done()
		});
		var buttonContainer:HTMLElement = document.createElement('div');

		this._node = document.createElement('div');
		this._connectionList = new GroupedConnectionList({
			app: this.get('app'),
			parent: this,
			showSearch: true
		});
		this._submitButton = button;

		this._node.appendChild(this._connectionList.detach());
		buttonContainer.classList.add('MessageFilters-dropDownActions');
		buttonContainer.appendChild(this._submitButton.detach());
		this._node.appendChild(buttonContainer);

		this._registerBindings();
		this._registerListeners();
	}

	protected _registerBindings():void {
		var binder = (<any> this.get('app')).get('binder');

		// TODO: Is it really safe to assume that the parent is a DropDown widget?
		this._bindingHandles.push(binder.createBinding(this, 'parent.isOpen')
			.observe((change:bindings.IChangeRecord<boolean>):void => {
				if (!change.value) {
					this._connectionList.set('search', '');
				}
			}));

		this._bindingHandles.push(binder.createBinding(this._connectionList.get('value'), '*')
			.observe((change:bindings.IChangeRecord<ISelectable>):void => {
				var connections:dstore.ICollection<ISelectable> = <any> this._connectionList.get('value');

				connections.fetch().then((selected:ISelectable[]):void => {
					this.emit(new Event({
						type: 'messageConnectionListChange',
						bubbles: true,
						cancelable: false,
						// Calling `slice` allows the array to be passed to setters without blocking
						// `Observable#_notify` and without the risk of the underlying data being mutated.
						target: selected.slice()
					}));
				});
			}));
	}

	protected _registerListeners():void {
		this._submitButton.on('activate', (event:ui.PointerEvent):void => {
			// TODO: This assumes that the parent is a DropDown widget. Although setting isOpen on the
			// parent in most cases won't affect anything, at some point it may become necessary to
			// find some other way of communicating that the DropDown should be closed.
			this.get('parent').set('isOpen', false);
			this.emit(new Event({
				type: 'messageConnectionListClosed',
				bubbles: true,
				cancelable: false,
				target: this
			}));
		});
	}
}

module MessageConnectionList {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'collection'):dstore.ICollection<Connection>;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'collection', value:dstore.ICollection<Connection>):void;
	}
}

export = MessageConnectionList;
