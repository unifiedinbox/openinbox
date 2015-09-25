import interfaces = require('mayhem/interfaces');
import Observable = require('mayhem/Observable');
import Promise = require('mayhem/Promise');
import Notification = require('../models/Notification');

interface T extends interfaces.IObservable {}

class NotificationObserver extends Observable {
	get:NotificationObserver.Getters;
	set:NotificationObserver.Setters;

	protected _autoCommit:boolean;
	protected _collection:dstore.ICollection<T>;
	protected _itemConstructor:T;

	protected _queue:Notification[];
	_queueGetter():Notification[] {
		return this._queue.slice(0);
	}

	destroy():void {
		super.destroy();
		this._collection = null;
		this._queue = null;
	}

	_initialize():void {
		this._autoCommit = false;
		this._queue = [];
	}

	add(newData:Notification):IPromise<Notification[]>;
	add(newData:Notification[]):IPromise<Notification[]>;
	add(newData:any):IPromise<Notification[]> {
		this._setQueue(this._queue.concat(newData));

		return Promise.resolve(this.get('queue'));
	}

	commit():IPromise<T[]> {
		var notifications = this._queue;
		var Model = <any> this._itemConstructor;
		var promises:Array<IPromise<T>> = [];
		// TODO: Counting backwards prevents this from being thrown into an infinite loop.
		// Figuring out *why* this happens will have to wait until time permits.
		for (var i = notifications.length; i--;) {
			var item = (<any> notifications[i]).get('item');
			// Items added to the queue are assumed to at least be the `kwArgs` for the Model.
			// Since dstore sets the Model as the __proto__ for the object, any item that is
			// not an instance of the Model must be created before being passed to `put`.
			var model = (Model && !(item instanceof Model)) ? new Model(item) : item;
			promises.unshift(this._collection.put(model));
		}

		this._setQueue([], true);

		return Promise.all(promises);
	}

	// We need to emit notifications when new items are added, but without granting setter privileges.
	protected _setQueue(value:Notification[], skipCommit:boolean = false):any {
		var oldQueue = this.get('queue');
		this._queue = value;
		this._notify('queue', this.get('queue'), oldQueue);

		if (!skipCommit && this._autoCommit) {
			this.commit();
		}
	}
}

module NotificationObserver {
	export interface Getters extends Observable.Getters {
		(key:'autoCommit'):boolean;
		(key:'collection'):dstore.ICollection<T>;
		(key:'itemConstructor'):T;
		(key:'queue'):Notification[];
	}

	export interface Setters extends Observable.Setters {
		(key:'autoCommit', value:boolean):void;
		(key:'collection', value:dstore.ICollection<T>):void;
		(key:'itemConstructor', value:T):void;
	}
}

export = NotificationObserver;
