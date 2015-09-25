import request = require('dojo/request');
import has = require('mayhem/has');
import Observable = require('mayhem/Observable');
import WebApplication = require('mayhem/WebApplication');
import connections = require('./connections/interfaces');
import endpoints = require('../endpoints');
import NotificationObserver = require('./NotificationObserver');
import adapters = require('../models/adapters/getNotifications');
import Comment = require('../models/Comment');
import Message = require('../models/Message');
import Notification = require('../models/Notification');
import Strophe = require('./connections/Strophe');

// The types returned by the getNotification API are not consistent
// with one another. Normalize them.
var apiTypeMap:HashMap<any> = {
	'newMsgNotification': 'message',
	'Mention': 'mention'
};

class NotificationManager extends Observable {
	get:NotificationManager.Getters;
	set:NotificationManager.Setters;

	protected _connection:connections.IConnection;
	protected _connectionData:HashMap<any>;
	protected _isWatching:boolean;
	protected _notificationObservers:NotificationManager.Observers;
	protected _startOnInitialize:boolean;

	constructor(kwArgs?:HashMap<any>) {
	    super(kwArgs);
	    this._setObservers();
	    this._setConnection();

	    if (this._startOnInitialize) {
	    	this.start();
	    }
	}

	add(data:NotificationManager.NotificationKwArgs):IPromise<Notification> {
		var type = data.type;
		var observer = (<any> this._notificationObservers)[type];
		var notification = new Notification(<any> data);

		if (observer) {
			observer.add(notification);
		}

		return Notification.store.put(notification);
	}

	destroy():void {
		super.destroy();
		this._connection.destroy();

		Object.keys(this._notificationObservers).forEach((key:string):void => {
			(<any> this._notificationObservers)[key].destroy();
		});
	}

	_initialize():void {
		this._isWatching = false;
		this._notificationObservers = <any> (has('es5') ? Object.create(null) : {});
		this._startOnInitialize = true;
	}

	start():void {
		this.set('isWatching', true);
		this._connection.connect();
	}

	stop():void {
		this.set('isWatching', false);
		this._connection.disconnect();
	}

	protected _formatResponse(data:HashMap<any>):IPromise<Notification> {
		var type:string = (<any> data).type;
		var observerType:string = (<any> apiTypeMap)[type];
		var adapter = (<any> adapters)[observerType];

		return this.add({
			id: (<any> data).id,
			type: observerType,
			isRead: (<any> data).isRead,
			item: adapter ? adapter(data) : data
		});
	}

	protected _loadNotification(message:Node):IPromise<Notification> {
		var app = <any> this.get('app');
		var user = <any> app.get('user');

		return request.post(endpoints.notifications, {
			handleAs: 'json',
			headers: {
				apikey: app.get('apikey'),
				app: user.get('uibApplication'),
				sessionId: user.get('sessionId')
			},
			data: {
				limit: 1,
				seeAllNotifications: false
			}
		}).then(this._formatResponse.bind(this));
	}

	protected _setConnection():void {
		this._connection = new Strophe({
			connectionData: this._connectionData,
			responseHandles: {
				message: [ this._loadNotification.bind(this) ]
			}
		});
	}

	protected _setObservers():void {
		var app:WebApplication = <any> this.get('app');
		var observers = this._notificationObservers;

		observers.message = new NotificationObserver({
			app: app,
			itemConstructor: Message,
			collection: Message.store
		});

		// TODO: Since the "new mentions" notification list uses a dstore collection so that it can actually observe
		// changes to the underlying models, this is not technically used, but is here in the name of consistency.
		observers.mention = new NotificationObserver({
			app: app,
			itemConstructor: Comment,
			collection: Comment.store
		});

		app.set('notifications', observers);
	}
}

module NotificationManager {
	export interface NotificationKwArgs {
		id:number;
		type:string;
		isRead:boolean;
		item:any;
	}

	export interface Observers {
		message:NotificationObserver;
		mention:NotificationObserver;
	}

	export interface Getters extends Observable.Getters {
		(key:'connectionData'):HashMap<any>;
		(key:'isWatching'):boolean;
	}

	export interface Setters extends Observable.Setters {
		(key:'connectionData', value:HashMap<any>):void;
		(key:'isWatching', value:boolean):void;
	}
}

export = NotificationManager;
