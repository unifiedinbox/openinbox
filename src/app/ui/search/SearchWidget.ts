import binding = require('mayhem/binding/interfaces');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import TextWidget = require('mayhem/ui/form/Text');
import util = require('mayhem/util');

/**
 * This class contains configuration and implementation for adding/removing a search
 * box at the top of any implementing widget.
 */
class SearchWidget extends SingleNodeWidget {
	get:SearchWidget.Getters;
	set:SearchWidget.Setters;

	_node:HTMLElement;
	protected _searchBinding:binding.IBindingHandle;
	protected _searchInputWidget:TextWidget;

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean) {
		this._searchInputWidget && this._searchInputWidget.set('isAttached', value);
		this._isAttached = value;
	}

	protected _showSearch:boolean;

	_showSearchGetter():boolean {
		return this._showSearch;
	}

	_showSearchSetter(showSearch:boolean):void {
		if (showSearch) {
			if (!this._searchInputWidget) {
				this._node.insertBefore(this._renderSearchNode(), this._node.firstChild);

				var app = this.get('app');
				var binder = app.get('binder');

				this._searchBinding = binder.bind({
					source: this._searchInputWidget,
					sourcePath: 'value',
					target: this,
					targetPath: 'search'
				});
			}
		}
		else {
			this._searchInputWidget.destroy();
			this._searchInputWidget = undefined;
			if (this._searchBinding) {
				this._searchBinding.remove();
			}
		}
		this._showSearch = showSearch;
	}

	protected _search:string;

	_searchGetter():string {
		return this._search;
	}
	/**
	 * Intended to be overridden by subclasses with logic to be performed
	 * upon search criteria update.
	 */
	_searchSetter(search:string):void {
		throw new Error('this method must be implemented');
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'showSearch' ], '_render');
		super(kwArgs);
	}

	_initialize() {
		super._initialize();
		this._showSearch = false;
		this._search = '';
	}

	destroy() {
		super.destroy();
		this._searchInputWidget && this._searchInputWidget.destroy();
	}

	/**
	 * Method intended to be called by subclasses' _render methods, to render
	 * the search input widget.
	 */
	_renderSearchNode():HTMLDivElement {
		var searchInput = new TextWidget({
			app: this.get('app'),
			placeholder: (<any> this.get('app').get('i18n')).get('messages').search(),
			autoCommit: true,
			parent: this
		});

		var searchNode = searchInput.detach();
		searchNode.classList.add('search-container');

		this._searchInputWidget = searchInput;
		return searchNode;
	}
}

module SearchWidget {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'firstNode'):HTMLElement;
		(key:'lastNode'):HTMLElement;
		(key:'showSearch'):boolean;
		(key:'search'):string;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'showSearch', showSearch:boolean):void;
		(key:'search', search:string):void;
	}
}

export = SearchWidget;
