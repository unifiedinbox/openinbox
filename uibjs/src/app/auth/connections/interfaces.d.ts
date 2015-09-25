import interfaces = require('mayhem/interfaces');

export interface IConnection extends interfaces.IObservable {
	connect:() => void;
	disconnect:() => void;
	dispatch:(...args:any[]) => void;
	reconnect?:() => void;
}
