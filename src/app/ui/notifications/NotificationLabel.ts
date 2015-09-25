import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import util = require('mayhem/util');

class NotificationLabel<T> extends SingleNodeWidget {
	get:NotificationLabel.Getters<T>;
	set:NotificationLabel.Setters<T>;

	_node:HTMLElement;
	protected _notificationCountSpan:HTMLElement;
	protected _collection:dstore.ICollection<T>;

	_collectionGetter():dstore.ICollection<T> {
		return this._collection;
	}

	_collectionSetter(collection:dstore.ICollection<T>):void {
		if (collection) {
			this._collection = collection;
			this._setNotificationCount();
			collection.on('add,update,delete', (event:dstore.ChangeEvent<T>):void => {
				this._setNotificationCount();
			});
		}
	}

	protected _notificationCount:number;

	_notificationCountGetter():number {
		return this._notificationCount;
	}

	_notificationCountSetter(count:number):void {
		var node = this._notificationCountSpan;
		this._notificationCount = count;

		if (node.firstChild) {
			node.removeChild(node.firstChild);
		}

		node.appendChild(document.createTextNode(String(count)));
		node.classList.toggle('is-hidden', !count);
	}

	constructor(kwArgs:HashMap<any>) {
		util.deferSetters(this, [ 'notificationCount', 'collection' ], '_render');
	    super(kwArgs);
	}

	_initialize():void {
		super._initialize();
		this.set('notificationCount', 0);
	}

	_render():void {
		this._node = document.createElement('div');
		this._node.className = 'icon-app-reminder';
		this._notificationCountSpan = document.createElement('span');
		this._notificationCountSpan.className = 'Notification-count';
		this._node.appendChild(this._notificationCountSpan);
	}

	protected _setNotificationCount():void {
		var self = this;

		this._collection.filter({ isRead: false }).fetch().then(function (notifications:T[]):void {
			self.set('notificationCount', notifications.length);
		});
	}
}

module NotificationLabel {
	export interface Getters<T> extends SingleNodeWidget.Getters {
		(key:'collection'):dstore.ICollection<T>;
		(key:'notificationCount'):number;
		(key:'firstNode'):HTMLElement;
		(key:'lastNode'):HTMLElement;
	}
	export interface Setters<T> extends SingleNodeWidget.Setters {
		(key:'collection', value:dstore.ICollection<T>):void;
		(key:'notificationCount', value:number):void;
	}
}

export = NotificationLabel;
