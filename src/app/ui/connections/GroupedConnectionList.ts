import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import ListView = require('mayhem/ui/ListView');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');
import PathRegExp = require('mayhem/routing/PathRegExp');
import Connection = require('../../models/Connection');
import ConnectionRow = require('./ConnectionRow');
import eTypeAdapter = require('../../models/adapters/eType');
import SearchWidget = require('../search/SearchWidget');
import SelectionManager = require('../../viewModels/SelectionManager');
import Avatar = require('../Avatar');
import TooltipLabel = require('../TooltipLabel');

class SelectAllWidget extends SingleNodeWidget {
	get:SelectAllWidget.Getters;
	set:SelectAllWidget.Setters;

	_node:HTMLAnchorElement;

	_connectionType:string;

	/*
	 * Reflects/updates the state of the select all/none text.
	 * DOES NOT actually affect selection.
	 */
	_isAllSelected:boolean;

	_isAllSelectedGetter():boolean {
		return this._isAllSelected;
	}

	_isAllSelectedSetter(isAllSelected:boolean):void {
		var messages = (<any> this.get('app').get('i18n')).get('messages');
		this.set('text', isAllSelected ? messages.selectNone() : messages.selectAll());
		this._isAllSelected = isAllSelected;
	}

	_text:string;

	_textGetter():string {
		return this._text;
	}

	_textSetter(text:string):void {
		this._text = text;
		if (this._node.firstChild) {
			this._node.removeChild(this._node.firstChild);
		}
		this._node.appendChild(document.createTextNode(this._text));
	}

	_initialize():void {
		super._initialize();
		this.set('isAllSelected', false);
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'text', 'isAllSelected' ], '_render');
		super(kwArgs);
	}

	_render():void {
		this._node = document.createElement('a');
		this._node.className = 'select-all';
	}
}

module SelectAllWidget {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'isAllSelected'):boolean;
	}
	export interface Setters extends SingleNodeWidget.Setters {
		(key:'isAllSelected', value:boolean):void;
	}
}

class GroupedConnectionList extends SearchWidget {
	get:GroupedConnectionList.Getters;
	set:GroupedConnectionList.Setters;

	_node:HTMLDivElement;

	protected _containerNodes:HashMap<HTMLDivElement>;
	protected _listViewNodes:HashMap<HTMLDivElement>;
	protected _listViews:HashMap<ListView<Connection>>;
	protected _selectAllWidgets:{ [key:string]:SelectAllWidget };
	protected _selectionManager:SelectionManager<Connection>;
	protected _totals:{ [key:string]:number };

	protected _filteredCollection:dstore.ICollection<SelectionManager.SelectableProxy<Connection>>;
	protected _wrappedCollection:dstore.ICollection<SelectionManager.SelectableProxy<Connection>>;
	protected _collection:dstore.ICollection<Connection>;

	_collectionGetter():dstore.ICollection<Connection> {
		return this._collection;
	}

	_collectionSetter(collection:dstore.ICollection<Connection>):void {
		this._filteredCollection = null;
		this._collection = collection;
		if (!collection) {
			this._wrappedCollection = null;
			return;
		}

		var wrappedCollection = this._wrappedCollection = this._selectionManager.wrapCollection(collection);
		this._selectionManager.reset();

		eTypeAdapter.forEachType(function (type) {
			var connectionType = eTypeAdapter.toConnectionType(type);
			var filteredCollection = wrappedCollection.filter({ type: type }).track();

			this._listViews[connectionType].set('collection', filteredCollection);

			// Update visibility of group based on whether items of this type exist
			filteredCollection.fetch().totalLength.then((total:number) => {
				this._totals[connectionType] = total;
				this._toggleContactListGroup(connectionType, total > 0);
			});
			filteredCollection.on('add, delete', (event:any) => {
				this._totals[connectionType] = event.totalLength;
				this._toggleContactListGroup(connectionType, event.totalLength > 0);
				this._updateSelectAllState(type);
			});

			// reset header text
			this._selectAllWidgets[connectionType].set('isAllSelected', false);
		}, this);
	}

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean) {
		for (var connectionType in this._listViews) {
			if (this._listViews[connectionType]) {
				this._listViews[connectionType].set('isAttached', value);
			}
		}
		this._isAttached = value;
	}

	_searchGetter():string {
		return this._search;
	}
	_searchSetter(search:string):void {
		if (search) {
			var self = this;
			var value = PathRegExp.escape(search);
			// TODO: escapeRegExp (once Mayhem has a function for it)
			this._filteredCollection =
				this._wrappedCollection.filter({ displayName: new RegExp(value, 'i') });

			this._selectionManager.reset();
			eTypeAdapter.forEachType(function (type) {
				var connectionType = eTypeAdapter.toConnectionType(type);
				var listView = this._listViews[connectionType];
				var filteredCollection = this._filteredCollection.filter({ type: type });
				listView.set('collection', filteredCollection);

				filteredCollection.fetch().totalLength.then(function (count:number) {
					self._toggleContactListGroup(connectionType, count > 0);
				});

				// reset header text
				this._selectAllWidgets[connectionType].set('isAllSelected', false);
			}, this);
		}
		else {
			this.set('collection', this._collection);
		}
		this._search = search;
	}

	_showSearchSetter(showSearch:boolean) {
		super._showSearchSetter(showSearch);
		// Ensure that filter is reset when toggling search (which will in turn reset selection and select-all)
		this.set('search', '');
	}

	protected _value:Connection[];

	_valueGetter():dstore.ICollection<SelectionManager.SelectableProxy<Connection>> {
		return this._selectionManager.get('selectedCollection');
	}

	_valueSetter(value:Connection[]):void {
		var collection = this.get('collection');
		this._selectionManager.reset();

		value = value || [];
		value.forEach(function (connection:Connection) {
			this._wrappedCollection.get(collection.getIdentity(connection))
				.then(function (item:SelectionManager.SelectableProxy<Connection>) {
					item.set('isSelected', true);
				});
		}, this);

		eTypeAdapter.forEachType((type) => {
			this._updateSelectAllState(type);
		});
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection', 'search', 'value' ], '_render');
		super(kwArgs);
	}

	destroy() {
		super.destroy();
		for (var connectionType in this._listViews) {
			if (this._listViews[connectionType]) {
				this._listViews[connectionType].destroy();
			}
			if (this._selectAllWidgets[connectionType]) {
				this._selectAllWidgets[connectionType].destroy();
			}
		}
	}

	_initialize() {
		super._initialize();
		this._containerNodes = {};
		this._listViewNodes = {};
		this._listViews = {};
		this._selectAllWidgets = {};
		this._totals = {};
		this._selectionManager = new SelectionManager<Connection>();
		this._value = [];
	}

	protected _renderHeaderNode(connectionType:string):HTMLDivElement {
		var title = (<any> this.get('app').get('i18n')).get('messages')[connectionType]();
		var titleNode = document.createElement('span');
		titleNode.classList.add('header-title');
		titleNode.appendChild(document.createTextNode(title));

		this._selectAllWidgets[connectionType] = new SelectAllWidget({
			app: this.get('app'),
			connectionType: connectionType,
			parent: this
		});

		var headerNode = document.createElement('div');
		headerNode.classList.add('group-header');
		headerNode.appendChild(titleNode);
		headerNode.appendChild(this._selectAllWidgets[connectionType].detach());
		return headerNode;
	}

	protected _renderGroupedListNode(connectionType:string):HTMLDivElement {
		this._listViews[connectionType] = new ListView<Connection>({
			app: this.get('app'),
			parent: this,
			itemConstructor: ConnectionRow
		});

		var listViewNode = <HTMLDivElement> this._listViews[connectionType].detach();
		listViewNode.classList.add('dgrid-autoheight');
		listViewNode.classList.add('ContactList-grid');

		var containerNode = document.createElement('div');
		// Initialize each container hidden to avoid a flash of headings before results are populated
		containerNode.className = 'group-container connection-type-' + connectionType + ' is-hidden';
		containerNode.appendChild(this._renderHeaderNode(connectionType));
		containerNode.appendChild(listViewNode);

		this._listViewNodes[connectionType] = listViewNode;
		this._containerNodes[connectionType] = containerNode;
		return containerNode;
	}

	protected _rowSelectionHandler(event:ui.PointerEvent):void {
		if (event.target instanceof SelectAllWidget) {
			this._selectAllHandler(event);
		}
		else if (event.target !== this) {
			var connectionRow:ConnectionRow;
			if (event.target instanceof Avatar || event.target instanceof TooltipLabel) {
				connectionRow = <ConnectionRow> event.target.get('parent');
			}
			else {
				connectionRow = <ConnectionRow> event.target;
			}
			this._selectHandler(connectionRow);
		}
	}

	protected _updateSelectAllState(type:string) {
		var connectionType = eTypeAdapter.toConnectionType(type);
		var totalSelected =
			this._selectionManager.get('selectedCollection').filter({ type: type }).fetchSync().totalLength;
		this._selectAllWidgets[connectionType].set('isAllSelected', totalSelected === this._totals[connectionType]);
	}

	protected _selectAllHandler(event:ui.PointerEvent):void {
		var widget = <SelectAllWidget> event.target;
		var connectionType = widget._connectionType;
		var isAllSelected = !widget.get('isAllSelected');

		widget.set('isAllSelected', isAllSelected);
		(this._filteredCollection || this._wrappedCollection).forEach(function (connection) {
			if (eTypeAdapter.toConnectionType((<any> connection).get('type')) === connectionType) {
				if (connection.get('isSelected') !== isAllSelected) {
					connection.set('isSelected', isAllSelected);
				}
			}
		});
	}

	protected _selectHandler(connectionRow:ConnectionRow):void {
		var connection = connectionRow.get('model');

		if (!connection) {
			return;
		}

		var isSelected = !connection.get('isSelected');
		connection.set('isSelected', isSelected);

		// Update the state of the corresponding SelectAllWidget
		var type = (<any> connection).get('type');
		var connectionType = eTypeAdapter.toConnectionType(type);
		var collection = this._listViews[connectionType].get('collection');
		collection.fetch().then((results) => {
			this._updateSelectAllState(type);
		});
	}

	protected _toggleContactListGroup(connectionType:string, show:boolean):void {
		this._containerNodes[connectionType].classList.toggle('is-hidden', !show);
	}

	_render():void {
		this._node = document.createElement('div');
		this._node.className = 'ContactList GroupedConnectionList';
		var wrapper = document.createElement('div');
		wrapper.className = 'ContactList-group';

		eTypeAdapter.forEachConnectionType(function (connectionType) {
			wrapper.appendChild(this._renderGroupedListNode(connectionType));
		}, this);

		this._node.appendChild(wrapper);

		this.on('pointerdown', this._rowSelectionHandler.bind(this));
	}
}

module GroupedConnectionList {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'collection'):dstore.ICollection<Connection>;
		(key:'firstNode'):HTMLDivElement;
		(key:'lastNode'):HTMLDivElement;
		(key:'listViews'):HashMap<ListView<Connection>>; // Exposed for testing
		(key:'value'):Connection[];
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'collection', collection:dstore.ICollection<Connection>):void;
		(key:'value', value:Connection[]):void;
	}
}

export = GroupedConnectionList;
