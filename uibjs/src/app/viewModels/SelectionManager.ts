import data = require('mayhem/data/interfaces');
import Observable = require('mayhem/Observable');
import Proxy = require('mayhem/data/Proxy');
import declare = require('dojo/_base/declare');
import Memory = require('dstore/Memory');
import Trackable = require('dstore/Trackable');

// This function typically comes from TypeScript itself so is available everywhere;
// it is used in wrapCollection to create an instance-specific version of the SelectableProxy constructor
declare function __extends(d:any, b:any):any;

class SelectionManager<T extends data.IModel> extends Observable {
	get:SelectionManager.Getters<T>;
	set:SelectionManager.Setters;

	protected _selectedCollection:Memory<SelectionManager.SelectableProxy<T>>;

	// TODO: Is this ever set more than once in the life-cycle of the consumer? If not,
	// it won't be possible to bind to hasSelections, since dstore#add/remove won't trigger
	// a change to the underlying selectedCollection property.
	_hasSelectionsDependencies() {
		return [ 'selectedCollection' ];
	}

	_hasSelectionsGetter() {
		return this._selectedCollection.fetchSync().length > 0;
	}

	protected _selectionMode:SelectionManager.SelectionMode;

	_selectionModeGetter():SelectionManager.SelectionMode {
		return this._selectionMode;
	}

	_selectionModeSetter(mode:SelectionManager.SelectionMode) {
		this._selectionMode = mode;
		this.reset();
	}

	_initialize() {
		super._initialize();
		this._selectionMode = SelectionManager.SelectionMode.multiple;
		this._selectedCollection = <Memory<SelectionManager.SelectableProxy<T>>> new (declare([ Memory, Trackable ]))();
	}

	/**
	 * Processes a requested change to the isSelected state of an item.
	 * Returns true if the change may proceed; false if it must abort
	 * (e.g. for already-selected item in single selection)
	 */
	processSelection(item:SelectionManager.SelectableProxy<T>, isSelected:boolean):void {
		var isSingle = this.get('selectionMode') === SelectionManager.SelectionMode.single;

		if (isSingle) {
			// TODO: Don't allow deselecting the only selected item, and avoid unnecessary churn if already selected
			// (probably requires refactoring to use an event rather than a binding)
			if (isSelected) {
				this.reset();
			}
		}

		if (isSelected) {
			this._selectedCollection.put(item);
		}
		else {
			this._selectedCollection.remove(this._selectedCollection.getIdentity(item));
		}
	}

	/**
	 * Deselects all currently-selected items.
	 */
	reset():IPromise<void> {
		return this._selectedCollection.fetch().then(function (results) {
			// Iterate backwards to avoid errors due to the array mutating during removal
			for (var i = results.length; i--;) {
				results[i].set('isSelected', false);
			}
		});
	}

	wrapCollection(collection:dstore.ICollection<T>):dstore.ICollection<SelectionManager.SelectableProxy<T>> {
		var self = this;

		// Create wrapper around original SelectableProxy constructor, capable of setting a reference to
		// this specific SelectionManager instance when each proxy is created.
		// This allows us to add the information we need, without needing to repeat all of the
		// wrapping that Proxy.forCollection already does, as long as we call forCollection in the
		// context of this altered constructor (so that forCollection picks it up as `this`).
		function SelectableProxy(kwArgs:HashMap<any>) {
			SelectionManager.SelectableProxy.call(this, kwArgs);
			this.set('selectionManager', self);
		}
		__extends(SelectableProxy, SelectionManager.SelectableProxy);

		var forCollection = SelectionManager.SelectableProxy.forCollection;
		// Need to inform TS of type since SelectableProxy.forCollection inherits type info from Proxy
		var wrapperCollection =
			<dstore.ICollection<SelectionManager.SelectableProxy<T>>> forCollection.call(SelectableProxy, collection);

		return wrapperCollection;
	}
}

module SelectionManager {
	export enum SelectionMode { single, multiple };

	export interface Getters<T extends data.IModel> extends Observable.Getters {
		(key:'hasSelections'):boolean;
		(key:'selectedCollection'):Memory<SelectionManager.SelectableProxy<T>>;
		(key:'selectionMode'):SelectionManager.SelectionMode;
	}

	export interface Setters extends Observable.Setters {
		(key:'selectionMode', value:SelectionManager.SelectionMode):void;
	}

	export class SelectableProxy<T extends data.IModel> extends Proxy<T> {
		get:SelectableProxy.Getters;
		set:SelectableProxy.Setters;

		protected _selectionManager:SelectionManager<T>;

		protected _isSelected:boolean;

		_isSelectedGetter() {
			return this._isSelected;
		}

		_isSelectedSetter(isSelected:boolean) {
			this.get('selectionManager').processSelection(this, isSelected);
			this._isSelected = isSelected;
		}

		_initialize():void {
			super._initialize();
			this._isSelected = false;
			this._selectionManager = null;
		}
	}

	export module SelectableProxy {
		export interface Getters extends Proxy.Getters {
			(key:'isSelected'):boolean;
			(key:'selectionManager'):SelectionManager<data.IModel>;
		}
		export interface Setters extends Proxy.Setters {
			(key:'isSelected', value:'boolean'):void;
			(key:'selectionManager', value:SelectionManager<data.IModel>):void;
		}
	}
}

export = SelectionManager;
