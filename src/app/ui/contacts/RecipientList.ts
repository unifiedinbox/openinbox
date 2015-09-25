import bindings = require('mayhem/binding/interfaces');
import Contact = require('../../models/Contact');
import ContactList = require('./ContactList');
import Event = require('mayhem/Event');
import Label = require('mayhem/ui/dom/Label');
import Message = require('../../models/Message');
import SelectionManager = require('../../viewModels/SelectionManager');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import util = require('mayhem/util');

enum SelectAction { All, None }

class RecipientList extends SingleNodeWidget {
	get:RecipientList.Getters;
	set:RecipientList.Setters;

	protected _bindingHandles:IHandle[];

	protected _collection:dstore.ICollection<Contact>;
	_collectionGetter():dstore.ICollection<Contact> {
		return this._collection;
	}
	_collectionSetter(collection:dstore.ICollection<Contact>):void {
		var self = this;
		this._collection = collection;

		if (collection) {
			collection.fetch().then(function (data:Contact[]) {
				self.set('collectionTotal', data.length);
			});
		}
		else {
			this.set('collectionTotal', 0);
		}

		this._contactList.set('collection', collection);
	}

	protected _contactList:ContactList;
	protected _contactListNode:HTMLElement;
	protected _message:Message;
	_node:HTMLElement;
	protected _selectAllLabel:Label;
	protected _selectAllLabelText:string;
	protected _selectAllNode:HTMLElement;

	protected _initialRecipients:Contact[];
	_initialRecipientsGetter():Contact[] {
		return this._initialRecipients;
	}
	_initialRecipientsSetter(value:Contact[]):void {
		this._initialRecipients = value;

		if (value && value.length) {
			this._contactList.set('value', value);
		}
	}

	_isAttachedSetter(isAttached:boolean) {
		this._contactList && this._contactList.set('isAttached', isAttached);
		this._isAttached = isAttached;
	}

	_valueGetter():dstore.ICollection<SelectionManager.SelectableProxy<Contact>> {
		return this._contactList.get('value');
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection', 'message', 'initialRecipients' ], '_render');

		super(kwArgs);
	}

	destroy() {
		super.destroy();

		this._contactList && this._contactList.destroy();
		this._bindingHandles.forEach(function (handle:IHandle):void {
			handle.remove();
		});
	}

	_initialize():void {
		super._initialize();

		this._bindingHandles = [];
	}

	_render() {
		var app = this.get('app');
		this._node = document.createElement('div');
		this._node.className = 'RecipientList';

		this._selectAllLabel = new Label({
			app: app,
			parent: this
		});

		this._setSelectState(SelectAction.All);
		this._selectAllNode = document.createElement('span');
		this._selectAllNode.classList.add('RecipientList_SelectAllNone');
		this._selectAllNode.appendChild(this._selectAllLabel.detach());

		this._contactList = new ContactList({
			app: app,
			parent: this,
			selectionMode: SelectionManager.SelectionMode.multiple
		});

		this._contactListNode = <HTMLElement> this._contactList.detach();
		this._node.appendChild(this._selectAllNode);
		this._node.appendChild(this._contactListNode);

		this.on('activate', this._setSelectAction.bind(this));
		this._registerBindings();
	}

	protected _registerBindings():void {
		var binder = this.get('app').get('binder');

		this._bindingHandles.push(binder.createBinding(this._contactList.get('value'), '*')
			.observe((change:bindings.IChangeRecord<any>):void => {
				this.emit(new Event({
					type: 'updateRecipients',
					bubbles: true,
					cancelable: false,
					target: this
				}));
			}));
	}

	protected _setSelectAction(event:UIEvent) {
		var self = this;
		var label:Label;
		var selectedRecipients = this._contactList.get('value');

		if (event.target instanceof Label) {
			label = <any> event.target;

			if (<any> label.get('action') === SelectAction.All) {
				this._setIsSelected(true);
				this._setSelectState(SelectAction.None);
			}
			else {
				this._setIsSelected(false);
				this._setSelectState(SelectAction.All);
			}
		}
		else {
			selectedRecipients.fetch().then(function (data:SelectionManager.SelectableProxy<Contact>[]) {
				if (data.length < self.get('collectionTotal')) {
					self._setSelectState(SelectAction.All);
				}
				else {
					self._setSelectState(SelectAction.None);
				}
			});
		}
	}

	protected _setIsSelected(isSelected:boolean) {
		var self = this;

		if (!this._collection) {
			return;
		}

		if (isSelected) {
			this._collection.fetch().then(function (contacts:Contact[]) {
				self._contactList.set('value', contacts);
			});
		}
		else {
			this._contactList.set('value', []);
		}
	}

	protected _setSelectState(selectState:SelectAction) {
		if (selectState === SelectAction.All) {
			this._selectAllLabel.set({
				text: (<any> this.get('app').get('i18n')).get('messages').selectAllCamelCase(),
				action: SelectAction.All
			});
		}
		else {
			this._selectAllLabel.set({
				text: (<any> this.get('app').get('i18n')).get('messages').selectNoneCamelCase(),
				action: SelectAction.None
			});
		}
	}
}

module RecipientList {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'collection'):dstore.ICollection<Contact>;
		(key:'collectionTotal'):number;
		(key:'initialRecipients'):Contact[];
		(key:'message'):Message;
		(key:'selectAction'):SelectAction;
		(key:'selectActionLabel'):string;
		(key:'value'):dstore.ICollection<SelectionManager.SelectableProxy<Contact>>;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'collection', collection:dstore.ICollection<Contact>):void;
		(key:'collectionTotal', collectionTotal:number):void;
		(key:'initialRecipients', value:Contact[]):void;
		(key:'message', message:Message):void;
		(key:'selectAction', value:SelectAction):void;
	}
}

export = RecipientList;
