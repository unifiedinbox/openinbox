import Model = require('mayhem/data/Model');

import Contact = require('./Contact');

/**
 * Model representing a contact and a specific account within that contact's data.
 * Used by RecipientsInput; wrapped by viewModels/Recipients for RecipientsList.
 */
class Recipient extends Model {
	get:Recipient.Getters;
	set:Recipient.Setters;

	protected _contact:Contact;
	protected _selectedAccount:number;
}

module Recipient {
	export interface Getters extends Model.Getters {
		(key:'contact'):Contact;
		(key:'selectedAccount'):number;
	};

	export interface Setters extends Model.Setters {
		(key:'contact', value:Contact):void;
		(key:'selectedAccount', value:number):void;
	};
}

export = Recipient;
