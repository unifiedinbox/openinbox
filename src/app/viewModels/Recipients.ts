import Observable = require('mayhem/Observable');
import Proxy = require('mayhem/data/Proxy');

import Recipient = require('../models/Recipient');

class Recipients extends Observable {
	get:Recipients.Getters;
	set:Recipients.Setters;

	protected _recipients:dstore.ICollection<Recipients.RecipientProxy>;

	_recipientsGetter() {
		return this._recipients;
	}
	_recipientsSetter(collection:dstore.ICollection<Recipient>) {
		// Need to inform TS of type since RecipientProxy.forCollection inherits type info from Proxy
		this._recipients =
			<dstore.ICollection<Recipients.RecipientProxy>> Recipients.RecipientProxy.forCollection(collection);
	}
}

module Recipients {
	export interface Getters extends Observable.Getters {
		(key:'recipients'):dstore.ICollection<Recipient>;
	}
	export interface Setters extends Observable.Setters {
		(key:'recipients', value:dstore.ICollection<Recipient>):void;
	}

	export class RecipientProxy extends Proxy<Recipient> {
		get:RecipientProxy.Getters;
		set:RecipientProxy.Setters;

		_selectedConnectionTypeGetter() {
			return this.get('contact').get('accounts')[this.get('selectedAccount')].eType || '';
		}
	}

	export module RecipientProxy {
		export interface Getters extends Recipient.Getters, Proxy.Getters {
			(key:'selectedConnectionType'):string;
		}

		export interface Setters extends Recipient.Setters, Proxy.Setters {
		}
	}
}

export = Recipients;
