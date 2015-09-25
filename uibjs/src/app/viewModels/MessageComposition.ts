import Contact = require('../models/Contact');
import Message = require('../models/Message');
import NewMessageProxy = require('./NewMessage');

// As this interface is only used by protected properties it is defined locally.
interface IContactMap {
	from:Contact;
	to:Contact[];
}

var priorityMap:HashMap<string> = {
	2: 'high',
	3: 'standard',
	4: 'low'
};

class MessageComposition extends NewMessageProxy {
	get:MessageComposition.Getters;
	set:MessageComposition.Setters;

	_contactsGetter():dstore.ICollection<Contact> {
		return <dstore.ICollection<Contact>> Contact.store;
	}

	protected _draftSaveOnClose:boolean;

	_draftSaveOnCloseClassDependencies():string[] {
		return [ 'draftSaveOnClose' ];
	}
	_draftSaveOnCloseClassGetter():string {
		return this._draftSaveOnClose ? '' : 'dijitHidden';
	}

	_highPriorityClassDependencies():string[] {
		return [ 'priority' ];
	}
	_highPriorityClassGetter():string {
		return this.get('priority') === Message.Priority.High ? 'selected' : '';
	}

	_lowPriorityClassDependencies():string[] {
		return [ 'priority' ];
	}
	_lowPriorityClassGetter():string {
		return this.get('priority') === Message.Priority.Low ? 'selected' : '';
	}

	_priorityLabelDependencies():string[] {
		return [ 'priority' ];
	}
	_priorityLabelGetter():string {
		var messages = (<any> this.get('app').get('i18n')).get('messages');
		var method:string = (<any> priorityMap)[this.get('priority')];

		return method ? (<any> messages)[method]() : '';
	}

	protected _showBcc:boolean;

	_showBccClassDependencies():string[] {
		return [ 'showCc', 'showBcc' ];
	}
	_showBccClassGetter():string {
		return this._showCc && this._showBcc ? '' : 'dijitHidden';
	}

	_showBccToggleClassDependencies():string[] {
		return [  'showCc', 'showBcc' ];
	}
	_showBccToggleClassGetter():string {
		return this._showCc && this._showBcc  ? 'dijitHidden' : '';
	}

	protected _showCc:boolean;

	_showCcClassDependencies():string[] {
		return [ 'showCc' ];
	}
	_showCcClassGetter():string {
		return this._showCc ? '' : 'dijitHidden';
	}

	_showCcToggleClassDependencies():string[] {
		return [ 'showCc' ];
	}
	_showCcToggleClassGetter():string {
		return this._showCc ? 'dijitHidden' : '';
	}

	protected _showPriority:boolean;

	_showPriorityClassDependencies():string[] {
		return [ 'showPriority' ];
	}
	_showPriorityClassGetter():string {
		return this._showPriority ? '' : 'dijitHidden';
	}

	_standardPriorityClassDependencies():string[] {
		return [ 'priority' ];
	}
	_standardPriorityClassGetter():string {
		return this.get('priority') === Message.Priority.Normal ? 'selected' : '';
	}

	_initialize():void {
		super._initialize();

		this.set({
			draftSaveOnClose: false,
			showBcc: false,
			showCc: false,
			showPriority: false,
		});
	}
}

module MessageComposition {
	export interface Getters extends NewMessageProxy.Getters {
		(key:'contacts'):dstore.ICollection<Contact>;
		(key:'draftSaveOnClose'):boolean;
		(key:'draftSaveOnCloseClass'):string;
		(key:'highPriorityClass'):string;
		(key:'lowPriorityClass'):string;
		(key:'showCcClass'):string;
		(key:'showCcToggleClass'):string;
		(key:'showBccClass'):string;
		(key:'showBccToggleClass'):string;
		(key:'showPriorityClass'):string;
		(key:'standardPriorityClass'):string;
	}

	export interface Setters extends NewMessageProxy.Setters {
		(key:'draftSaveOnClose', draftSaveOnClose:boolean):void;
	}
}

export = MessageComposition;
