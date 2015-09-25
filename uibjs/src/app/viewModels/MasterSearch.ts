import Proxy = require('mayhem/data/Proxy');
import Contact = require('../models/Contact');

class ContactProxy extends Proxy<Contact> {
	get:ContactProxy.Getters;
	set:ContactProxy.Setters;

	protected _isHighlighted:boolean;

	_initialize():void {
		super._initialize();
		this._isHighlighted = false;
	}
}

module ContactProxy {
	export interface Getters extends Contact.Getters, Proxy.Getters {
		(key:'isHighlighted'):boolean;
	};

	export interface Setters extends Contact.Setters, Proxy.Setters {
		(key:'isHighlighted', value:boolean):void;
	};
}

export = ContactProxy;
