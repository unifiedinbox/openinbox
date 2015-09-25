import ListView = require('mayhem/ui/ListView');
import PathRegExp = require('mayhem/routing/PathRegExp');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');
import Avatar = require('../Avatar');
import Contact = require('../../models/Contact');
import ContactRow = require('./ContactRow');
import SearchWidget = require('../search/SearchWidget');
import SelectionManager = require('../../viewModels/SelectionManager');
import TooltipLabel = require('../TooltipLabel');

class ContactList extends SearchWidget {
	get:ContactList.Getters;
	set:ContactList.Setters;

	_node:HTMLDivElement;

	protected _listViewNode:HTMLDivElement;
	protected _listView:ListView<Contact>;
	protected _selectionManager:SelectionManager<Contact>;

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean) {
		this._listView.set('isAttached', value);
		this._isAttached = value;
	}

	_searchGetter():string {
		return this._search;
	}
	_searchSetter(search:string):void {
		if (search) {
			var value = PathRegExp.escape(search);
			var matcher = new RegExp(value, 'i');

			this._listView.set('collection', this._wrappedCollection.filter({ 'displayName': matcher }));
			this._selectionManager.reset();
		}
		else {
			this.set('collection', this._collection);
		}
		this._search = search;
	}

	_showSearchSetter(showSearch:boolean) {
		super._showSearchSetter(showSearch);
		// Ensure that filter is reset when toggling search (which will in turn reset selection)
		this.set('search', '');
	}

	protected _wrappedCollection:dstore.ICollection<SelectionManager.SelectableProxy<Contact>>;
	protected _collection:dstore.ICollection<Contact>;

	_collectionGetter():dstore.ICollection<Contact> {
		return this._collection;
	}
	_collectionSetter(collection:dstore.ICollection<Contact>):void {
		this._collection = collection;
		if (!collection) {
			this._wrappedCollection = null;
		}
		else {
			this._wrappedCollection = this._selectionManager.wrapCollection(collection);
		}
		this._listView.set('collection', this._wrappedCollection);
		this._selectionManager.reset();
	}

	protected _selectionMode:SelectionManager.SelectionMode;

	_selectionModeGetter():SelectionManager.SelectionMode {
		return this._selectionManager.get('selectionMode');
	}

	_selectionModeSetter(mode:SelectionManager.SelectionMode) {
		this._selectionManager.set('selectionMode', mode);
	}

	protected _showConnectionTypes:boolean;

	_showConnectionTypesGetter():boolean {
		return this._showConnectionTypes;
	}

	_showConnectionTypesSetter(showConnectionTypes:boolean):void {
		this._node.classList.toggle('hide-connection-types', !showConnectionTypes);
	}

	_valueGetter():dstore.ICollection<SelectionManager.SelectableProxy<Contact>> {
		// TODO: This is bindable, but is also not read-only which would be ideal
		return this._selectionManager.get('selectedCollection');
	}

	_valueSetter(value:Contact[]):void {
		var collection = this.get('collection');
		this._selectionManager.reset();

		value = value || [];
		value.forEach(function (contact:Contact) {
			this._wrappedCollection.get(collection.getIdentity(contact))
				.then(function (item:SelectionManager.SelectableProxy<Contact>) {
					item.set('isSelected', true);
				});
		}, this);
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection', 'search', 'showConnectionTypes', 'value' ], '_render');
		super(kwArgs);
	}

	_initialize() {
		super._initialize();
		this._showConnectionTypes = true;
		this._selectionManager = new SelectionManager<Contact>();
	}

	destroy() {
		super.destroy();
		this._listView.destroy();
	}

	protected _rowSelectionHandler(event:ui.PointerEvent):void {
		var contactRow:ContactRow;
		if (event.target instanceof Avatar || event.target instanceof TooltipLabel) {
			contactRow = <ContactRow> event.target.get('parent');
		}
		else {
			contactRow = <ContactRow> event.target;
		}

		var contact = contactRow.get('model');
		contact.set('isSelected', !contact.get('isSelected'));
	}

	_render():void {
		this._node = document.createElement('div');
		this._node.className = 'ContactList with-SelectableItem';

		this._listView = new ListView<Contact>({
			app: this.get('app'),
			parent: this,
			itemConstructor: ContactRow
		});

		this._listViewNode = <HTMLDivElement> this._listView.detach();
		this._listViewNode.classList.add('dgrid-autoheight');
		this._listViewNode.classList.add('ContactList-grid');
		this._node.appendChild(this._listViewNode);

		this.on('activate', this._rowSelectionHandler.bind(this));
	}
}

module ContactList {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'firstNode'):HTMLDivElement;
		(key:'lastNode'):HTMLDivElement;
		(key:'collection'):dstore.ICollection<Contact>;
		(key:'listView'):ListView<Contact>; // Exposed for testing
		(key:'showConnectionTypes'):boolean;
		(key:'value'):dstore.ICollection<SelectionManager.SelectableProxy<Contact>>;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'collection', collection:dstore.ICollection<Contact>):void;
		(key:'showConnectionTypes', showConnectionTypes:boolean):void;
		(key:'value', value:dstore.ICollection<SelectionManager.SelectableProxy<Contact>>):void;
	}
}

export = ContactList;
