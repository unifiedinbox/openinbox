declare module 'strophe/Base64' {
	var Base64:{
		encode(input:string):string;
		decode(input:string):string;
	};

	export = Base64;
}

declare module 'strophe/strophe' {
	export function getText(elem:Node):string;

	// Strophe.Handler is documented as a private class, but instances of it
	// are still returned by public interfaces.
	class Handler {
		constructor(handler:() => void, ns?:string, name?:string, type?:string, from?:string, options?:HashMap<any>);
	}

	class Connection {
		constructor(endpoint:string);
		connect(jid:string, password:string, onConnect:(status:number) => void):void;
		attach(jid:string, sid:string, rid:string, onConnect:(status:number) => void, wait?:number, hold?:number, wind?:number):void;
		disconnect(reason?:string):void;
		addHandler(handler:(elem:Node) => void, ns?:string, name?:string, type?:string, from?:string, options?:HashMap<any>):Handler;
		deleteHandler(handler:(elem:Node) => void):void;
	}
}
