/// <amd-dependency path="mayhem/templating/html!./RecipientsList.html" />

import aspect = require('dojo/aspect');
import on = require('dojo/on');

import Event = require('mayhem/Event');
import Promise = require('mayhem/Promise');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');

import Memory = require('dstore/Memory'); // For type information

import Connection = require('../../models/Connection');
import ConnectionList = require('../connections/ConnectionList');
import ConnectionRow = require('../connections/ConnectionRow');
import Contact = require('../../models/Contact');
import MasterSearch = require('../search/MasterSearch');
import NavigableSearchWidget = require('../search/NavigableSearchWidget'); // for SearchEvent
import Recipient = require('../../models/Recipient');
import RecipientsViewModel = require('../../viewModels/Recipients');
import TrackableMemory = require('../../models/stores/TrackableMemory');
import appUtil = require('../../util');

var RecipientsList = require<any>('mayhem/templating/html!./RecipientsList.html');

class RecipientsInput extends SingleNodeWidget {
	get:RecipientsInput.Getters;
	set:RecipientsInput.Setters;

	_node:HTMLElement;
	protected _connectionList:ConnectionList;
	protected _masterSearch:MasterSearch;
	protected _recipientsList:any; // RecipientsList
	protected _connectionListCloseHandle:IHandle;
	protected _recipientsCollection:Memory<Recipient>;

	protected _contactsCollection:dstore.ICollection<Contact>;

	_contactsCollectionGetter():dstore.ICollection<Contact> {
		return this._contactsCollection;
	}

	_contactsCollectionSetter(collection:dstore.ICollection<Contact>) {
		this._contactsCollection = collection;
		this._masterSearch.set('collection', collection);
	}

	_isAttachedGetter():boolean {
		return this._isAttached;
	}

	_isAttachedSetter(isAttached:boolean) {
		this._isAttached = isAttached;
		this._masterSearch.set('isAttached', isAttached);
		this._recipientsList.set('isAttached', isAttached);
		this._connectionList.set('isAttached', isAttached);
	}

	protected _isConnectionListOpen:boolean;

	_isConnectionListOpenGetter():boolean {
		return this._isConnectionListOpen;
	}
	_isConnectionListOpenSetter(isOpen:boolean) {
		this._isConnectionListOpen = isOpen;
		this._connectionList.get('firstNode').classList.toggle('is-open', isOpen);
		(<any> this._connectionListCloseHandle)[isOpen ? 'resume' : 'pause']();
	}

	_valueGetter():string[] {
		return this._recipientsCollection.fetchSync().map(function (recipient) {
			return recipient.get('contact').get('accounts')[recipient.get('selectedAccount')].address;
		});
	}

	_valueSetter(values:string[]) {
		var app = this.get('app');

		// TODO: technically this should attempt to re-associate values to contacts,
		// but there is no efficient way of doing that currently, as all that is stored
		// in messages are address strings, and the only way to correlate that back
		// currently would involve expensive filtering through the entire store.
		// Ideally there should be an easy way to correlate recipients back to contacts.

		// It'd be potentially nice to be able to reset the store in one fell swoop,
		// but I'm not sure that's possible without breaking binding.
		var recipientsStore = this._recipientsCollection;
		appUtil.removeAll(recipientsStore).then(function () {
			if (values) {
				values.forEach(function (value) {
					recipientsStore.add(new Recipient({
						app: app,
						contact: new Contact({
							app: app,
							displayName: value,
							accounts: [ { address: value } ]
						}),
						selectedAccount: 0
					}));
				});
			}
		});
	}

	constructor(kwArgs:HashMap<any>) {
		util.deferSetters(this, [ 'contactsCollection' ], '_render');
		super(kwArgs);
	}

	_initialize() {
		super._initialize();
		this._recipientsCollection = <Memory<Recipient>> new TrackableMemory();
	}

	_registerEvents() {
		function stopPropagation(event:Event) {
			event.stopPropagation();
		}

		var masterSearch = this._masterSearch;
		var ui = <any> this.get('app').get('ui');

		masterSearch.on('keydown', this._handleSearchKeyboardEvent.bind(this));
		masterSearch.on('searchSubmit', this._handleSearchSubmitEvent.bind(this));
		// Stop propagation of other events, since the Inbox view expects these from the main search
		masterSearch.on('masterSearchChange', stopPropagation);
		masterSearch.on('masterSearchFocus', stopPropagation);
		masterSearch.on('masterSearchSubmit', stopPropagation);
		masterSearch.on('searchResultSelected', stopPropagation);
		this.on('activate', this._handleActivate.bind(this));

		// Need to use any types below because on.pausable's definitions currently assume DOM-only
		this._connectionListCloseHandle = on.pausable(ui, 'pointerdown', (event:any) => {
			if (!appUtil.contains(this._connectionList, event.target)) {
				this.set('isConnectionListOpen', false);
				event.stopPropagation();
				event.preventDefault();
			}
		});
	}

	_render() {
		var app = this.get('app');
		var node = this._node = document.createElement('div');
		node.className = 'RecipientsInput';

		var recipientsList = this._recipientsList = new RecipientsList({
			app: app,
			model: new RecipientsViewModel({ recipients: this._recipientsCollection }),
			parent: this
		});

		var masterSearch = this._masterSearch = new MasterSearch({
			app: app,
			parent: this,
			searchPlaceholder: '',
			resultsClass: 'ContactList--recipients'
		});

		// Create a single ConnectionList instance now; collection and other properties will be set later
		var connectionList = this._connectionList = new ConnectionList({
			app: app,
			parent: this
		});
		connectionList.get('firstNode').classList.add('ConnectionList--recipient');

		node.appendChild(recipientsList.detach());
		node.appendChild(masterSearch.detach());
		// The ConnectionList will be managed like a popup, so append to the body
		document.body.appendChild(connectionList.detach());

		this._registerEvents();
	}

	destroy() {
		super.destroy();
		this._masterSearch.destroy();
		this._recipientsList.destroy();
		this._connectionList.destroy();
		this._connectionListCloseHandle.remove();
	}

	protected _emit(type:string, recipient:Recipient):void {
		var event = new RecipientsInput.RecipientEvent({
			type: type,
			bubbles: true,
			cancelable: false,
			target: this
		});
		event.item = recipient;
		this.emit(event);
	}

	protected _handleActivate(event:ui.PointerEvent) {
		var target = <any> event.target;
		if (!appUtil.contains(this._masterSearch, target) && !appUtil.contains(this._connectionList, target)) {
			this._masterSearch.set('isFocused', true);
		}
	}

	protected _handleSearchKeyboardEvent(event:ui.KeyboardEvent) {
		var recipientsStore = this._recipientsCollection;
		if (event.code === 'Backspace' && !this._masterSearch.get('search')) {
			// Remove last entered recipient if backspace is pressed when no text is entered
			recipientsStore.fetch().then((recipients) => {
				var lastRecipient = recipients[recipients.length - 1];
				if (lastRecipient) {
					recipientsStore.remove(recipientsStore.getIdentity(lastRecipient));
					this._emit('recipientRemoved', lastRecipient);
				}
			});
		}

		// Cancel the connection list popup on any keypress
		// (need to exclude Enter since that is normally what _opens_ the popup)
		if (event.code !== 'Enter' && this._isConnectionListOpen) {
			this.set('isConnectionListOpen', false);
		}
	}

	protected _handleSearchSubmitEvent(event:NavigableSearchWidget.SearchEvent<Contact>) {
		// Prevent this event from unwittingly triggering logic further up the UI
		event.stopPropagation();

		var app = this.get('app');
		var accounts = event.item && event.item.get('accounts');
		var selectedAccountPromise:IPromise<number>;

		if (!accounts || accounts.length === 1) {
			selectedAccountPromise = Promise.resolve(0);
		}
		else {
			// Prompt the user to select which of the contact's connections this message should be sent to.
			// Note: This same construct can also ultimately be used (sans image) to select which connection
			// to send the message *from*, but this would require the services overall supporting the
			// notion of sending a message *from* multiple accounts at once, since this applies per-recipient.
			selectedAccountPromise = this._promptConnectionList({
				collection: new Memory({
					data: accounts.map(function (account) {
						return new Connection({
							account: account.address,
							type: account.eType
						});
					})
				}),
				image: event.item.get('image'),
				title: event.item.get('displayName')
			}).then(function (connectionRow) {
				// XXX: This seems hacky, but we need it to render the correct connection type from the Contact.
				// (Maybe we could rework it to preserve something other than the index?)
				// The `- 1` is to adjust for dgrid's initial preload node.
				var row = connectionRow.get('firstNode');
				return Array.prototype.indexOf.call((<HTMLElement> row.parentNode).children, row) - 1;
			});
		}

		var contact:Contact = event.item ? event.item : new Contact({
			app: app,
			displayName: event.value,
			accounts: [ { address: event.value } ]
		});

		selectedAccountPromise.then((selectedAccount) => {
			var recipient = new Recipient({
				app: app,
				contact: contact,
				selectedAccount: selectedAccount
			});
			this._recipientsCollection.add(recipient);
			this._emit('recipientAdded', recipient);

			// TODO: It's not necessarily clear from the mockup whether the search should be cleared only after
			// a cnonection is selected, but that seems to be the least jarring approach.
			// However, what should happen if a user attempts to modify it while the menu is open?
			this._masterSearch.set('search', '');
		}, function () {});
	}

	/**
	 * Updates the ConnectionList instance with the given arguments, shows it,
	 * and returns a promise resolving when a connection is selected,
	 * or rejecting when the popup is dismissed.
	 */
	protected _promptConnectionList(kwArgs:HashMap<any>):IPromise<ConnectionRow> {
		var connectionList = this._connectionList;
		connectionList.set(kwArgs);
		appUtil.positionNode(connectionList.get('firstNode'), this._masterSearch.get('firstNode'));
		this.set('isConnectionListOpen', true);

		return new Promise((resolve, reject) => {
			var successHandle = (<any> on).once(connectionList, 'connectionSelected', (event:Event) => {
				resolve(event.target);
				failureHandle.remove();
				this.set('isConnectionListOpen', false);
				this._masterSearch.set('isFocused', true);
			});
			var failureHandle = aspect.before(this, '_isConnectionListOpenSetter', function (isOpen) {
				if (!isOpen) {
					reject(new Error('User canceled connection selection'));
					successHandle.remove();
					failureHandle.remove();
				}
			});
		});
	}
}

module RecipientsInput {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'contactsCollection'):dstore.ICollection<Contact>;
		(key:'firstNode'):HTMLElement;
		(key:'lastNode'):HTMLElement;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'contactsCollection', value:dstore.ICollection<Contact>):void;
	}

	export class RecipientEvent extends Event {
		item:Recipient = null;
	}
}

export = RecipientsInput;
