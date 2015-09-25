import Event = require('mayhem/Event');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import TextWidget = require('mayhem/ui/form/Text');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');
import Widget = require('mayhem/ui/dom/Widget');

var keyCodeMethodMap:{ [key:string]:string } = {
	ArrowUp: 'previousRow',
	ArrowDown: 'nextRow',
	Enter: 'selectRow',
	Escape: 'hideList'
};

/**
 * This class contains configuration and implementation for adding/removing a search
 * box at the top of any implementing widget.
 */
class SearchWidget<T> extends SingleNodeWidget {
	get:SearchWidget.Getters<T>;
	set:SearchWidget.Setters<T>;

	_node:HTMLElement;
	protected _searchBindings:IHandle[];
	protected _searchInputWidget:TextWidget;

	protected _searchPlaceholder:string;
	_searchPlaceholderGetter():string {
		return this._searchPlaceholder;
	}
	_searchPlaceholderSetter(value:string):void {
		this._searchPlaceholder = value;
		this._searchInputWidget.set('placeholder', value);
	}

	protected _searchResults:IPromise<T[]>;
	protected _searchResultsIndex:number;
	protected _searchResultsNode:HTMLElement;

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

				this._searchBindings = [
					binder.bind({
						source: this._searchInputWidget,
						sourcePath: 'value',
						target: this,
						targetPath: 'search'
					}),

					binder.bind({
						source: this._searchInputWidget,
						sourcePath: 'isFocused',
						target: this,
						targetPath: 'isFocused'
					})
				];

				this._searchInputWidget.on('keydown', this._handleSearchKeyboardEvent.bind(this));
			}
		}
		else {
			this._searchInputWidget.destroy();
			this._searchInputWidget = undefined;
			if (this._searchBindings) {
				this._searchBindings.forEach(function (handle:IHandle):void {
					handle.remove();
				});
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
		util.deferSetters(this, [ 'showSearch', 'searchPlaceholder' ], '_render');
		super(kwArgs);
	}

	_initialize():void {
		super._initialize();

		this._search = '';
		this._searchPlaceholder = '';
		this._searchResultsIndex = -1;
		this._showSearch = false;
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
			placeholder: this._searchPlaceholder || (<any> this.get('app').get('i18n')).get('messages').search(),
			autoCommit: true,
			parent: this
		});

		var searchNode = searchInput.detach();
		searchNode.classList.add('search-container');
		this._registerSearchResultEvents();

		this._searchInputWidget = searchInput;
		return searchNode;
	}

	previousRow(event?:ui.KeyboardEvent):void {
		// preserve caret position throughout navigation
		event && event.preventDefault();
		this._updateSearchIndex(-1);
	}

	nextRow(event?:ui.KeyboardEvent):void {
		// preserve caret position throughout navigation
		event && event.preventDefault();
		this._updateSearchIndex();
	}

	selectRow(event?:Event, selectedValue?:string):void;
	selectRow(event?:ui.UiEvent, selectedValue?:string):void;
	selectRow(event?:any, selectedValue?:string):void {
		// NOTE: event is currently unused; selectedValue is currently passed for click events
		this._searchResults && this._searchResults.then((items:T[]) => {
			var index:number = selectedValue ? this._getResultItemIndex(items, selectedValue) :
				this._searchResultsIndex;

			var event = new SearchWidget.SearchEvent<T>({
				type: 'searchSubmit',
				bubbles: true,
				cancelable: false,
				target: this
			});

			// If the index is -1, then the user has not navigated to a particular result, so the
			// search text should be used.
			if (index === -1) {
				event.value = this._searchInputWidget.get('value');
			}
			else {
				items.forEach((item:T, i:number) => {
					(<any> item).set('isHighlighted', false);

					if (i === index) {
						var value = this._getSearchInputValue(item);
						this._searchInputWidget.set('value', value);
						event.item = item;
						event.value = value;
					}
				});
			}

			this.emit(event);
		});

		this._searchResults = null;
		this.hideList();
	}

	hideList():void {
		var index = this._searchResultsIndex;

		this._searchResultsIndex = -1;
		this._searchResultsNode.classList.add('is-hidden');
		this._searchResults && this._searchResults.then(function (items:T[]):void {
			var previous:any = items[index];
			previous && previous.set('isHighlighted', false);
		});
	}

	protected _updateSearchIndex(increment:number = 1):void {
		var self = this;

		this._searchResults.then(function (items:T[]):void {
			var index:number = self._searchResultsIndex;
			var previous:any = items[index];

			self._searchResultsIndex = (Math.max(-1, index + increment) + items.length) % items.length;
			previous && previous.set('isHighlighted', false);
			(<any> items[self._searchResultsIndex]).set('isHighlighted', true);
		});
	}

	protected _registerSearchResultEvents():void {
		this.on('searchResultSelected', this._handleSearchResultsClick.bind(this));
	}

	protected _handleSearchKeyboardEvent(event:ui.KeyboardEvent):void {
		var methodName:string;

		// `Enter` is used to both submit the form and select search results.
		if (event.code === 'Enter' || !this._searchResultsNode.classList.contains('is-hidden')) {
			methodName = keyCodeMethodMap[event.code];

			if (methodName) {
				(<any> this)[methodName](event);
			}
		}
	}

	protected _handleSearchResultsClick(event:Event):void {
		var row:Widget = <any> event.target;

		this.selectRow(event, this._getSearchInputValue(<any> row.get('model')));
	}

	protected _getResultItemIndex(items:T[], value:string):number {
		for (var i = items.length; i--;) {
			var testValue:string = this._getSearchInputValue((<any> items[i]));

			if (testValue === value) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Intended to be overridden by subclasses with logic to be performed
	 * upon selecting a result.
	 */
	protected _getSearchInputValue(item:T):string {
		throw new Error('Widget#_getSearchInputValue must be implemented.');
	}
}

module SearchWidget {
	export interface Getters<T> extends SingleNodeWidget.Getters {
		(key:'isFocused'):boolean;
		(key:'firstNode'):HTMLElement;
		(key:'lastNode'):HTMLElement;
		(key:'search'):string;
		(key:'searchPlaceholder'):string;
		(key:'searchResults'):IPromise<T[]>;
		(key:'showSearch'):boolean;
	}

	export interface Setters<T> extends SingleNodeWidget.Setters {
		(key:'isFocused', value:boolean):void;
		(key:'search', search:string):void;
		(key:'searchPlaceholder', value:string):void;
		(key:'searchResults', value:IPromise<T[]>):void;
		(key:'showSearch', showSearch:boolean):void;
	}

	export class SearchEvent<T> extends Event {
		item:T = null;
		value:string = '';
	}
}

export = SearchWidget;
