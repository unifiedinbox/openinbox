import Base64 = require('strophe/Base64');
import Strophe = require('strophe/strophe');
import connections = require('./interfaces');
import Observable = require('mayhem/Observable');
import endpoints = require('../../endpoints');

/**
 * The numerical keys below correspond to a status defined on `Strophe.Status`:
 * 0: ERROR
 * 1: CONNECTING
 * 2: CONNFAIL
 * 3: AUTHENTICATING
 * 4: AUTHFAIL
 * 5: CONNECTED
 * 6: DISCONNECTED
 * 7: DISCONNECTING
 * 8: ATTACHED
 */
var statusMap:{ [key:string]:string; } = {
	1: '_setIsConnecting',
	2: '_setIsConnecting',
	4: '_reauthorize',
	5: '_onSuccess',
	6: 'reconnect',
	7: '_setIsConnecting',
	8: '_onSuccess'
};

class StropheConnection extends Observable implements connections.IConnection {
	get:StropheConnection.Getters;
	set:StropheConnection.Setters;

	protected _attemptCount:number;
	protected _connection:Strophe.Connection;
	protected _connectionData:StropheConnection.ConnectionData;
	protected _isConnecting:boolean;
	protected _maxAttemptCount:number;
	protected _reauthAttempted:boolean;
	protected _responseHandles:{ [key:string]:Function[] };

	connect():void {
		var data = this._connectionData;
		var jid = data.jid && String(data.jid);
		var onConnect = this._onConnect.bind(this);
		var endpoint:string = (location.protocol === 'http:') ? endpoints.boshHttpService : endpoints.boshService;

		this._connection = new Strophe.Connection(endpoint);

		if (data.session) {
			this._connection.connect(jid, Base64.decode(data.session), onConnect);
		}
		else {
			this._connection.attach(jid, String(data.sid), String(parseInt(data.rid, 10) + 1), onConnect);
		}
	}

	destroy():void {
		super.destroy();
		this._responseHandles = null;
		this.disconnect();
	}

	disconnect():void {
		if (this._connection) {
			this._removeHandles();
			this._connection.disconnect();
			this._connection = null;
		}
	}

	dispatch(message:Node):boolean {
		var type:string = (<any> message).getAttribute('type');
		var idNodes:NodeList = (<any> message).getElementsByTagName('id');
		var id:string = Strophe.getText(idNodes[0]);
		var handles = this._responseHandles;

		Object.keys(handles).forEach((key:string):void => {
			var callbacks = handles[key];

			if (callbacks && callbacks.length) {
				callbacks.forEach((handle:(data:{ type:string; id:number; }) => void):void => {
					handle({
						type: type,
						id: Number(id)
					});
				});
			}
		});

		// Prevents Strophe.js from removing the handle after calling it.
		return true;
	}

	_initialize():void {
		this._attemptCount = 0;
		this._maxAttemptCount = 4;
	}

	reconnect():void {
		this._attemptCount += 1;

		this.disconnect();
		// TODO Log the failed connection somewhere?
		if (this._attemptCount <= this._maxAttemptCount) {
			this.connect();
		}
	}

	protected _onConnect(statusIndex:number):void {
		var method = statusMap[statusIndex];
		if (method) {
			// TS7017
			(<any> this)[method](status);
		}
	}

	protected _onSuccess():void {
		Object.keys(this._responseHandles).forEach((key:string):void => {
			this._connection.addHandler(this.dispatch.bind(this), null, key);
		});
	}

	protected _reauthorize():void {
		if (!this._reauthAttempted) {
			this._reauthAttempted = true;
			this.reconnect();
		}
	}

	protected _removeHandles():void {
		this._connection.deleteHandler(this._onConnect.bind(this));
		this._connection.deleteHandler(this.dispatch.bind(this));
	}

	protected _setIsConnecting(status:string):void {
		this._isConnecting = (status === 'CONNECTING');
	}
}

module StropheConnection {
	export interface ConnectionData {
		jid:string;
		rid?:string;
		session?:string;
		sid?:string;
	}

    export interface Getters extends Observable.Getters {
    	(key:'attemptCount'):number;
    	(key:'connectionData'):StropheConnection.ConnectionData;
    	(key:'maxAttemptCount'):number;
    	(key:'onConnectHandle'):Function;
    	(key:'responseHandles'):{ [key:string]:Function };
    }

    export interface Setters extends Observable.Setters {
    	(key:'connectionData', value:StropheConnection.ConnectionData):void;
    	(key:'maxAttemptCount', value:number):void;
    	(key:'onConnectHandle', value:Function):void;
    	(key:'responseHandles', value:{ [key:string]:Function }):void;
    }
}

export = StropheConnection;
