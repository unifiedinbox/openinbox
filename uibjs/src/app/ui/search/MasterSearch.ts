import bindings = require('mayhem/binding/interfaces');
import Contact = require('../../models/Contact');
import ContactProxy = require('../../viewModels/MasterSearch');
import ContactRow = require('../contacts/ContactRow');
import Event = require('mayhem/Event');
import lang = require('dojo/_base/lang');
import ListView = require('mayhem/ui/dom/ListView');
import SearchWidget = require('./NavigableSearchWidget');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');
import WebApplication = require('mayhem/WebApplication');

class SearchableContactRow extends ContactRow {
	get:SearchableContactRow.Getters<Contact>;
	set:SearchableContactRow.Setters;

	_render():void {
		super._render();
		this._registerEvents();
	}

	_registerBindings():void {
		var app:WebApplication = <any> this.get('app');
		var binder = app.get('binder');
		var self = this;

		super._registerBindings();

		this._bindingHandles.push(binder.createBinding(this.get('model'), 'isHighlighted')
			.observe(function (change:bindings.IChangeRecord<boolean>):void {
				self._node.classList.toggle('is-highlighted', change.value);
			}));
	}

	protected _registerEvents():void {
		this.on('activate', (event:ui.ClickEvent):void => {
			this.emit(new Event({
				type: 'searchableContactRowSelect',
				bubbles: true,
				cancelable: false,
				target: this
			}));
		});
	}
}

module SearchableContactRow {
	export interface Getters<Contact> extends ContactRow.Getters {};
	export interface Setters extends ContactRow.Setters {};
}

class MasterSearch extends SearchWidget<Contact> {
	get:MasterSearch.Getters<Contact>;
	set:MasterSearch.Setters<Contact>;

	_node:HTMLElement;

	protected _bindingHandles:IHandle[];

	protected _collection:dstore.ICollection<ContactProxy>;
	_collectionGetter():dstore.ICollection<ContactProxy> {
		return <any> this._collection;
	}
	_collectionSetter(value:dstore.ICollection<Contact>):void {
		if (value) {
			this._collection = <any> ContactProxy.forCollection(value);

			this._listView.set('collection', this._collection);
		}
	}

	/**
	 * This is necessary to allow the results list to be closed when the input loses focus,
	 * but still allow the results to be clicked.
	 */
	protected _hasPointerFocus:boolean;

	_isAttachedSetter(value:boolean):void {
		super._isAttachedSetter(value);

		this._listView.set('isAttached', value);
	}

	protected _listView:ListView<Contact>;

	protected _resultsClass:string;
	_resultsClassGetter():string {
		return this._resultsClass;
	}
	_resultsClassSetter(value:string):void {
		var node:HTMLElement = <any> this._listView.get('firstNode');
		var previous = this._resultsClass;

		this._resultsClass = value;

		if (previous) {
			node.classList.remove(previous);
		}

		if (value) {
			node.classList.add(value);
		}
	}

	_searchSetter(search:string):void {
		var self = this;
		this._search = search;

		if (this._isAttached) {
			this.hideList();

			var searchResults:dstore.ICollection<ContactProxy> = this._filterSearchResults(search);
			this._listView.set('collection', searchResults);
			this._searchResults = <any> searchResults.fetch();
			this._emit('masterSearchChange');

			this._searchResults.then(function (contacts:Contact[]):void {
				self._searchResultsNode.classList.toggle('is-hidden', !search.length || !contacts.length);
			});
		}
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection', 'resultsClass', 'search' ], '_render');
		super(kwArgs);
	}

	destroy():void {
		super.destroy();

		this._listView.destroy();
		this._bindingHandles.forEach(function (handle:IHandle):void {
			handle.remove();
		});
	}

	_initialize():void {
		super._initialize();

		this._bindingHandles = [];
		this.set({
			hasPointerFocus: false,
			showSearch: true,
		});
	}

	_render():void {
		this._node = document.createElement('div');
		this._node.classList.add('MasterSearch');

		this._renderListView();
		this._registerBindings();
		this._registerEvents();
	}

	protected _emit(type:string, options?:any):void {
		if (type) {
			this.emit(new Event(lang.mixin({
				type: type,
				bubbles: true,
				cancelable: false,
				target: this
			}, options)));
		}
	}

	protected _filterSearchResults(search:string):dstore.ICollection<ContactProxy> {
		var pattern = new RegExp('(^|\\s)' + search.replace(/\\/g, '\\\\'), 'i');

		return this._collection.filter(function (contact:Contact):boolean {
			return pattern.test(contact.get('displayName'));
		});
	}

	protected _getSearchInputValue(contact:Contact):string {
		return contact.get('displayName');
	}

	protected _registerBindings():void {
		var app = <any> this.get('app');
		var binder = app.get('binder');

		this._bindingHandles.push(binder.createBinding(this, 'isFocused')
			.observe((change:bindings.IChangeRecord<boolean>):void => {
				this._emit('masterSearchFocus');

				if (this._searchResultsNode) {
					if (!change.value && !this._hasPointerFocus) {
						this._searchResultsNode.classList.add('is-hidden');
					}
					else if (this._searchResults) {
						this._searchResults.then((contacts:Contact[]):void => {
							this._searchResultsNode.classList.toggle('is-hidden', (!this.get('search') || !contacts.length));
						});
					}
				}
			}));
	}

	protected _registerEvents():void {
		this.on('searchSubmit', (event:Event):void => {
			event.stopPropagation();
			this._emit('masterSearchSubmit');
		});

		this.on('searchableContactRowSelect', (event:Event):void => {
			// TODO: If a different widget wraps both this and the results widget, then both `searchResultSelected`
			// events will be caught by that ancestor. Eventually, the MasterSearch should be updated to rely
			// entirely on the event system and view model to know when it should be updated.
			event.stopPropagation();
			// TODO: For some reason, the model is available here, but `undefined` when queried by event listeners.
			this._emit('searchResultSelected', { target: event.target, item: event.target.get('model') });
		});

		this.on('pointerenter', (event:ui.PointerEvent):void => {
			this._hasPointerFocus = true;
		});

		this.on('pointerleave', (event:ui.PointerEvent):void => {
			this._hasPointerFocus = false;
		});
	}

	protected _renderListView():void {
		var listView = new ListView<Contact>({
			app: this.get('app'),
			parent: this,
			itemConstructor: SearchableContactRow,
			sort: 'displayName'
		});
		var listViewNode = <HTMLElement> listView.detach();

		this._searchResultsNode = listViewNode;
		listViewNode.className = 'ContactList ContactList--autocomplete dgrid-autoheight is-hidden';
		this._listView = listView;

		this._node.appendChild(listViewNode);
	}
}

module MasterSearch {
	export interface Getters<Contact> extends SearchWidget.Getters<Contact> {
		(key:'collection'):dstore.ICollection<ContactProxy>;
		(key:'resultsClass'):string;
	};

	export interface Setters<Contact> extends SearchWidget.Setters<Contact> {
		(key:'collection', value:dstore.ICollection<Contact>):void;
		(key:'resultsClass', value:string):void;
	};
}

export = MasterSearch;
