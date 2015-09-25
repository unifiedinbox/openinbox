import bindings = require('mayhem/binding/interfaces');
import Event = require('mayhem/Event');
import lang = require('dojo/_base/lang');
import ListView = require('mayhem/ui/dom/ListView');
import Message = require('../../models/Message');
import MessageActions = require('./MessageActions');
import MessageActionsViewModel = require('../../viewModels/MessageActions');
import MessageProxy = require('../../viewModels/MessageList');
import MessageRow = require('./MessageRow');
import SelectionManager = require('../../viewModels/SelectionManager');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import TemplatedWidget = require('mayhem/ui/View');
import util = require('mayhem/util');

interface ISelectable extends SelectionManager.SelectableProxy<Message> {}
interface ISelectableStore extends dstore.ICollection<ISelectable> {}

class MessageList extends SingleNodeWidget {
	get:MessageList.Getters;
	set:MessageList.Setters;

	protected _bindingHandles:IHandle[];
	protected _fetchRangeHandle:IHandle;
	protected _listView:ListView<Message>;

	protected _collection:ISelectableStore;
	_collectionGetter():ISelectableStore {
		return this._collection;
	}
	_collectionSetter(value:dstore.ICollection<Message>):void {
		var self = this;

		if (this._collectionHandle) {
			this._collectionHandle.remove();
		}

		if (value) {
			var collection:ISelectableStore = this._selectionManager.wrapCollection(value);

			this._collection = <any> MessageProxy.forCollection(<any> collection).sort('date', true);
			this._resetMessageActions();
			this._listView.set('collection', this._collection);
			this._forceEmptyCheck();

			this._collectionHandle = this._collection.on('add, delete',
				function (event:dstore.ChangeEvent<ISelectable>):void {
					var totalLength = self.get('totalLength');

					if (event.type === 'add') {
						self.set('totalLength', totalLength + 1);
					}
					else if (event.type === 'delete') {
						self.set('totalLength', Math.max(0, totalLength - 1));
					}
				});
		}
	}

	protected _collectionHandle:IHandle;

	protected _currentFolderName:string;
	_currentFolderNameGetter():string {
		return this._currentFolderName;
	}
	_currentFolderNameSetter(value:string):void {
		this._currentFolderName = value;

		(<any> this._messageActions.get('model')).set('currentFolderName', value);
	}

	_isAttachedSetter(value:boolean):void {
		this._isAttached = value;
		this._listView.set('isAttached', value);
		this._messageActions.set('isAttached', value);
	}

	protected _isInSearchMode:boolean;
	_isInSearchModeGetter():boolean {
		return this._isInSearchMode;
	}
	_isInSearchModeSetter(value:boolean):void {
		this._isInSearchMode = value;
		this._node.classList.toggle('is-inSearchMode', value);
	}

	protected _messageActions:TemplatedWidget;
	_node:HTMLElement;
	protected _pointerTimer:IHandle;

	protected _selectionManager:SelectionManager<Message>;

	protected _totalLength:number;
	_totalLengthGetter():number {
		return this._totalLength;
	}
	_totalLengthSetter(value:number):void {
		this._totalLength = value;

		this._emit(this._isInSearchMode ? 'searchFetchRange' : 'messageFetchRange');
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection' ], '_render');
		super(kwArgs);
	}

	_initialize():void {
		super._initialize();
		this._bindingHandles = [];
		this._selectionManager = new SelectionManager<Message>();
	}

	destroy():void {
		super.destroy();
		this._listView.destroy();
		this._messageActions.destroy();
		this._collectionHandle && this._collectionHandle.remove();
		this._fetchRangeHandle && this._fetchRangeHandle.remove();
		this._bindingHandles.forEach(function (handle:IHandle):void {
			handle.remove();
		});
	}

	_render():void {
		var app = <any> this.get('app');

		this._node = document.createElement('div');
		// While it is recommended to not use `dgrid-autoheight` with OnDemandList, the necessary styles are
		// added to prevent problems and still render this according to the design.
		this._node.className = 'MessageList dgrid-autoheight with-SelectableItem';

		this._listView = new ListView<Message>({
			app: app,
			itemConstructor: MessageRow,
			parent: this
		});

		this._node.appendChild(this._listView.detach());

		this._registerBindings();
		this._registerEvents();
	}

	protected _emit(type:string):void {
		if (type) {
			this.emit(new Event({
				type: type,
				bubbles: true,
				cancelable: false,
				target: this
			}));
		}
	}

	// TODO: Since ListView passes its collection to DstoreAdapter, aspecting the `fetchRange` method
	// in order to emit the `messageFetchRange` event won't work.
	protected _forceEmptyCheck():void {
		this._collection.fetchRange({ start: 0, end: 1 }).totalLength.then((totalLength:number):void => {
			// TODO: where should this go? This widget doesn't have its own model,
			// though it does have a collection. But the collection doesn't seem the right place for it.
			// It has to be available to event listeners, so for now listeners can access the total via
			// event.target.get('totalLength')
			this.set('totalLength', totalLength);
		});
	}

	protected _registerBindings():void {
		var app = <any> this.get('app');
		var binder = <any> app.get('binder');

		this._bindingHandles.push(binder.createBinding(app, 'bulkMessageAction')
			.observe((change:bindings.IChangeRecord<any>):void => {
				var data:{ property:string; value:any; } = change.value;

				this._selectionManager.get('selectedCollection').forEach((message:ISelectable):void => {
					message.set(data.property, data.value);
				}).then(():void => {
					this._selectionManager.reset();
				});
			}));
	}

	protected _registerEvents():void {
		// TODO: SelectionManager#_hasSelections lists 'selectedCollection' as a dependency.
		// However, that collection is only set once, and Mayhem doesn't include dstore events
		// when looking at the dependencies list. Once this issue is resolved, switch to binding
		// to `this._selectionManager.get('hasSelections')`.
		this._selectionManager.get('selectedCollection')
			.on('add,delete', (change:dstore.ChangeEvent<ISelectable>):void => {
				var hasSelections:boolean = <any> this._selectionManager.get('hasSelections');

				this._node.classList.toggle('is-inSelectionMode', hasSelections);
				this.get('app').set('isMessageListInSelectionMode', hasSelections);
			});

		this.on('messageRowPointerEnter', (event:Event):void => {
			var row:TemplatedWidget = <any> event.target;
			var model = <any> row.get('model');
			var messageActions = this._messageActions;

			if (messageActions.get('parent') !== row) {
				model.get('messageActionsData').then((options:HashMap<any>):void => {
					(<any> messageActions.get('model')).set(lang.mixin({ isOpen: true, message: model }, options));
				});

				messageActions.set('parent', row);
				row.set('messageActions', messageActions);
			}
			else {
				this._pointerTimer && this._pointerTimer.remove();
			}
		});

		this.on('messageRowPointerLeave', (event:Event):void => {
			var messageActions = <any> this._messageActions;

			if (!messageActions.get('hasOpenDropDown')) {
				messageActions.reset(true);
			}
			else {
				this._pointerTimer = util.createTimer(():void => {
					messageActions.set('hasOpenDropDown', false);
					messageActions.reset(true);
				}, 100);
			}
		});
	}

	// TODO: Navigating between folders results in MessageActions slipping between the cracks after
	// returning to a previously-visited folder. Resetting it each time the collection is set solves
	// the problem, but is it possible to fix this without needing to recreate the widget?
	protected _resetMessageActions():void {
		var app = this.get('app');

		this._messageActions && this._messageActions.destroy();

		// MessageActions' `parent` and other properties are set on the fly by the row widgets.
		this._messageActions = new MessageActions({
			app: app,
			model: new MessageActionsViewModel({
				app: app,
				currentFolderName: this.get('currentFolderName')
			})
		});
	}
}

module MessageList {
    export interface Getters extends SingleNodeWidget.Getters {
    	(key:'collection'):ISelectableStore;
    	(key:'currentFolderName'):string;
    	(key:'isInSearchMode'):boolean;
    	(key:'firstNode'):HTMLElement;
    	(key:'lastNode'):HTMLElement;
		(key:'totalLength'):number;
    }

    export interface Setters extends SingleNodeWidget.Setters {
    	(key:'collection', value:dstore.ICollection<Message>):void;
    	(key:'currentFolderName', value:string):void;
    	(key:'isInSearchMode', value:boolean):void;
		(key:'totalLength', value:number):void;
    }
}

export = MessageList;
