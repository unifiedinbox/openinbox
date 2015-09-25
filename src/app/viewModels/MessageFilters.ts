import Connection = require('../models/Connection');
import Message = require('../models/Message');
import Observable = require('mayhem/Observable');
import Promise = require('mayhem/Promise');
import SelectionManager = require('./SelectionManager');
import WebApplication = require('mayhem/WebApplication');

interface ISearchAction {
	filter:string;
	text:string;
}

class MessageFilters extends Observable {
	get:MessageFilters.Getters;
	set:MessageFilters.Setters;

	protected _counts:IPromise<HashMap<string>>;
	protected _lastCounts:HashMap<string>;
	_countsDependencies():string[] {
		return [ 'isOpen' ];
	}
	_countsGetter():IPromise<HashMap<string>> {
		if (!this.get('isOpen')) {
			return Promise.resolve(this._lastCounts || {});
		}
		else {
			var countsPromise = (<any> this.get('messages')).getMessageCounts();

			return countsPromise.then((counts:HashMap<number>):HashMap<string> => {
				this._lastCounts = <any> Object.keys(counts).reduce(function (data:HashMap<number>, key:string):HashMap<number> {
					var count:string = (<any> counts)[key];

					if (count) {
						(<any> data)[key] = ' (' + String(count) + ')';
					}

					return data;
				}, {});

				return this._lastCounts;
			});
		}
	}

	protected _isInSearchMode:boolean;
	_isInSearchModeGetter():boolean {
		return this._isInSearchMode;
	}
	_isInSearchModeSetter(value:boolean):void {
		this._isInSearchMode = value;

		if (value) {
			// Per the SOW1 scope document, the filters menu "must show automatically and cannot be closed".
			this.set('isOpen', true);
		}
	}

	protected _isOpen:boolean;
	_isOpenGetter():boolean {
		return this._isOpen;
	}
	_isOpenSetter(value:boolean):void {
		// Per the SOW1 scope document, the filters menu "must show automatically and cannot be closed".
		this._isOpen = this._isInSearchMode ? true : value;
	}

	protected _linkText:string;
	_linkTextDependencies():string[] {
		return [ 'selectedFilter', 'selectedSort' ];
	}
	_linkTextGetter():string {
		var app:WebApplication = <any> this.get('app');
		var messages = (<any> app.get('i18n')).get('messages');

		return messages.filterBarLabel({
			filter: this.get('selectedFilterLabel'),
			sort: this.get('selectedSortLabel')
		});
	}

	protected _searchActions:string[];
	_searchActionsGetter():ISearchAction[] {
		var app = <any> this.get('app');
		var messages = app && (<any> app.get('i18n')).get('messages');

		return !this._searchActions ? [] :
			this._searchActions.reduce(function (actions:ISearchAction[], action:string):ISearchAction[] {
				var message = messages && messages[action];

				if (typeof message === 'function') {
					actions.push({ filter: action, text: message() });
				}

				return actions;
			}, []);
	}
	_searchActionsSetter(value:string[]):void {
		this._searchActions = value;
	}

	protected _selectedFilterLabel:string;
	_selectedFilterLabelDependencies():string[] {
		return [ 'selectedFilter' ];
	}
	_selectedFilterLabelGetter():string {
		return this._getLabel(this.get('selectedFilter'));
	}

	protected _selectedSortLabel:string;
	_selectedSortLabelDependencies():string[] {
		return [ 'selectedSort' ];
	}
	_selectedSortLabelGetter():string {
		return this._getLabel(this.get('selectedSort'));
	}

	protected _stateClasses:string;
	_stateClassesDependencies():string[] {
		return [ 'isInSearchMode', 'isOpen', 'selectedFilter', 'selectedSearchFilter' ];
	}
	_stateClassesGetter():string {
		var classes:string[] = [];

		if (this.get('isInSearchMode')) {
			// Per the SOW1 scope document, the filters menu "must show automatically and cannot be closed".
			classes.push('is-inSearchMode', 'is-open');

			if (this.get('selectedSearchFilter')) {
				classes.push('is-filtered--' + this.get('selectedSearchFilter'));
			}
		}
		else {
			classes.push((this.get('isOpen') ? 'is-open' : 'is-closed'));

			if (this.get('selectedFilter')) {
				classes.push('is-filtered--' + this.get('selectedFilter'));
			}
		}

		return classes.join(' ');
	}

	_initialize():void {
		// Required to avoid clashes with model scenarios.
		this._counts = null;
		this._linkText = this._selectedFilterLabel = this._selectedSortLabel = this._stateClasses = '';

		this.set({
			isInSearchMode: false,
			isOpen: false,
			messages: null,
			searchActions: [ 'allResults', 'from', 'to', 'subject', 'attachments' ],
			selectedConnections: null,
			selectedFilter: 'allMessages',
			selectedSearchFilter: 'allResults',
			selectedSort: 'date'
		});
	}

	/**
	 * Filter/sort values correspond to method names on app/nls/main.
	 */
	protected _getLabel(filter:string):string {
		var app:WebApplication = <any> this.get('app');
		var messages = (<any> app.get('i18n')).get('messages');

		return messages[filter]();
	}
}

module MessageFilters {
	export interface Getters extends Observable.Getters {
		(key:'counts'):IPromise<HashMap<string>>;
		(key:'isInSearchMode'):boolean;
		(key:'isOpen'):boolean;
		(key:'linkText'):string;
		(key:'messages'):dstore.ICollection<Message>;
		(key:'searchActions'):ISearchAction[];
		(key:'selectedConnections'):SelectionManager.SelectableProxy<Connection>[];
		(key:'selectedFilter'):string;
		(key:'selectedFilterLabel'):string;
		(key:'selectedSearchFilter'):string;
		(key:'selectedSort'):string;
		(key:'selectedSortLabel'):string;
		(key:'stateClasses'):string;
	}

	export interface Setters extends Observable.Setters {
		(key:'isInSearchMode', value:boolean):void;
		(key:'isOpen', value:boolean):void;
		(key:'messages', value:dstore.ICollection<Message>):void;
		(key:'searchActions', value:string[]):void;
		(key:'selectedConnections', value:SelectionManager.SelectableProxy<Connection>[]):void;
		(key:'selectedFilter', value:string):void;
		(key:'selectedSearchFilter', value:string):void;
		(key:'selectedSort', value:string):void;
	}
}

export = MessageFilters;
