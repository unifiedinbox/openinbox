import bindings = require('mayhem/binding/interfaces');
import Contact = require('../models/Contact');
import Connection = require('../models/Connection');
import Conversation = require('../models/Conversation');
import data = require('mayhem/data/interfaces');
import Folder = require('../models/Folder');
import lang = require('dojo/_base/lang');
import mayhemUtil = require('mayhem/util');
import Message = require('../models/Message');
import MessageActionsViewModel = require('./MessageActions');
import MessageFiltersViewModel = require('./MessageFilters');
import Observable = require('mayhem/Observable');
import util = require('../util');
import WebApplication = require('mayhem/WebApplication');

var sortByMap:HashMap<{ column:string; order:string; }> = {
	date: { column: 'date', order: 'DESC' },
	sender: { column: 'from', order: 'ASC' }
};

class Inbox extends Observable {
	get:Inbox.Getters;
	set:Inbox.Setters;

	protected _bindingHandles:IHandle[];

	protected _compositionAction:string;

	protected _compositionMessage:Message;
	_compositionMessageGetter():Message {
		return this._compositionMessage;
	}
	_compositionMessageSetter(value:Message):void {
		this._compositionMessage = value;

		if (value) {
			this.set('isInCompositionMode', true);
		}
	}

	protected _compositionMessageSource:Message;

	protected _folder:Folder;
	_folderGetter():Folder {
		return this._folder;
	}
	_folderSetter(folder:Folder):void {
		var current:Folder = this.get('folder');

		if (!current || folder.get('id') !== <any> current.get('folderId')) {
			this.set('messages', Message.store.filter({
				folderId: folder.get('id')
			}));

			this._messageActionsModel && this._messageActionsModel.set('currentFolderName', folder.get('name'));
			this._resetState();
		}

		this._folder = folder;
	}

	protected _isActionsVisible:boolean;
	protected _isFetching:boolean;
	protected _isInboxZeroVisible:boolean;

	protected _isInCompositionMode:boolean;
	_isInCompositionModeGetter():boolean {
		return this._isInCompositionMode;
	}
	_isInCompositionModeSetter(value:boolean):void {
		this._isInCompositionMode = value;

		if (!value) {
			this.set('compositionMessage', null);
		}
	}

	_isInSearchModeDependencies():string[] {
		return [ 'masterSearchIsFocused', 'masterSearchValue' ];
	}
	_isInSearchModeGetter():boolean {
		var isInSearchMode:boolean = this.get('masterSearchIsFocused') || Boolean(this.get('masterSearchValue'));

		// TODO: This is not ideal, but we need a way to prevent attachments in message rows from being
		// fetched prematurely. Since it is not currently possible to access the message models without
		// making a call to the database, `app.isInSearchMode` is watched my MessageRow instead.
		(<any> this.get('app')).set('isInSearchMode', isInSearchMode);

		return isInSearchMode;
	}

	protected _isMessageListVisible:boolean;
	protected _isSidebarVisible:boolean;
	protected _lastUpdated:Date;

	protected _lastUpdatedDisplay:string;
	_lastUpdatedDisplayDependencies() {
		return [ 'lastUpdated' ];
	}
	_lastUpdatedDisplayGetter():string {
		var messages = (<any> this.get('app')).get('i18n').get('messages');

		this._lastUpdatedDisplay = util.formatSmartTime(this.get('lastUpdated'), messages);

		return this._lastUpdatedDisplay;
	}

	protected _lastUpdatedHandle:IHandle;

	// TODO: It would be more consistent to name this "messageSearch" (and also rename
	// "masterSearchSubmitValue" to "messageSearchSubmit").
	protected _masterSearchValue:string;
	_masterSearchValueGetter():string {
		return this._masterSearchValue;
	}
	_masterSearchValueSetter(value:string):void {
		this._masterSearchValue = value;

		if (!value) {
			this.set('searchResultCount', null);
		}

		// `masterSearchValue` is reset during navigation, but we do not want the collection to be filtered then.
		if (this.get('isInSearchMode')) {
			this._searchTimer && this._searchTimer.remove();
			this._searchTimer = mayhemUtil.createTimer(():void => {
				this._searchMessages(value);
			}, 300);
		}
	}

	protected _masterSearchSubmitValue:string;
	_masterSearchSubmitValueGetter():string {
		return this._masterSearchSubmitValue;
	}
	_masterSearchSubmitValueSetter(value:data.IProxyModel<Contact>):void;
	_masterSearchSubmitValueSetter(value:string):void;
	_masterSearchSubmitValueSetter(value:any):void {
		var searchType:string = (typeof value === 'string') ? 'all' : 'people';
		this._masterSearchSubmitValue = (typeof value === 'string') ? value : value.get('displayName');

		this._searchMessages(this._masterSearchSubmitValue, searchType);
	}

	protected _message:Message;
	_messageGetter():Message {
		return this._message;
	}
	_messageSetter(value:Message):void {
		this._message = value;

		if (value) {
			this.set('conversations', Conversation.store.filter({ messageId: value.get('id') }));
		}
	}

	protected _messageActionsModel:MessageActionsViewModel;
	protected _messageFiltersModel:MessageFiltersViewModel;

	protected _messages:dstore.ICollection<Message>;
	_messagesGetter():dstore.ICollection<Message> {
		return this._messages;
	}
	_messagesSetter(value:dstore.ICollection<Message>):void {
		this._messages = value;

		this.set('isFetching', Boolean(this._stashedMessages));
		this.get('messageFiltersModel').set('messages', value);
	}

	/**
	 * Filters messages using one of the standard filters, or via the free-form search.
	 * In order to avoid fetching the "all messages" collection multiple times, it is stashed
	 * when a filter/search is set and then restored when the filter/search is cleared.
	 */
	protected _stashedMessages:dstore.ICollection<Message>;

	protected _messageCount:number;
	_messageCountGetter():number {
		return this._messageCount || 0;
	}
	_messageCountSetter(messageCount:number):void {
		var self = this;

		this._messageCount = messageCount;
		this.set('lastUpdated', new Date());

		if (!this._lastUpdatedHandle) {
			var lastSyncTimer = setInterval(function () {
				var messages = (<any> self.get('app')).get('i18n').get('messages');
				var oldValue = self._lastUpdatedDisplay;
				var newValue = util.formatSmartTime(self.get('lastUpdated'), messages);

				self._notify('lastUpdatedDisplay', newValue, oldValue);
			}, 60000);

			this._lastUpdatedHandle = mayhemUtil.createHandle(function () {
				clearInterval(lastSyncTimer);
			});
		}
	}

	_messageCountDisplayDependencies() {
		return [ 'messageCount' ];
	}
	_messageCountDisplayGetter():string {
		var messageCount = this.get('messageCount');
		var messages = (<any> this.get('app')).get('i18n').get('messages');

		return messages.messages({ NUM: messageCount });
	}

	protected _messageConnectionsFilter:Connection[];
	_messageConnectionsFilterGetter():Connection[] {
		return this._messageConnectionsFilter;
	}
	_messageConnectionsFilterSetter(value:Connection[]):void {
		this._messageConnectionsFilter = value;

		if (!value || !value.length) {
			this.set('showNoResultsMessage', false);
			this.set('messages', this._stashedMessages);
			this._stashedMessages = null;
		}
		else {
			if (!this._stashedMessages) {
				this._stashedMessages = this._messages;
			}

			var search:string = <any> value.map(function (connection:Connection):string {
				return <any> connection.get('displayName');
			}).join(',');

			this.set('messages', (<any> this._stashedMessages).search(search, 'from'));
		}
	}

	protected _messageFilter:string;
	_messageFilterGetter():string {
		return this._messageFilter;
	}
	_messageFilterSetter(standardFilter:string):void {
		this._messageFilter = standardFilter;

		if (!standardFilter || (standardFilter === 'allMessages')) {
			this.set('showNoResultsMessage', false);
			this.set('messages', this._stashedMessages);
			this._stashedMessages = null;
		}
		else {
			if (!this._stashedMessages) {
				this._stashedMessages = this._messages;
			}

			this.set('showNoResultsMessage', true);
			this.set('messages', (<any> this._stashedMessages).search(standardFilter, 'standardFilter'));
		}
	}

	protected _messageSearchFilter:string;
	_messageSearchFilterGetter():string {
		return this._messageSearchFilter;
	}
	_messageSearchFilterSetter(value:string):void {
		var filter:string = (!value || value === 'allResults') ? 'all' : value;
		this._messageSearchFilter = value;

		// This field is only ever set when a search is in progress, and the "sort by" option
		// disappears while searching, so it is safe to assume that 1) this._stashedMessages exists
		// and 2) any additional operations can take place on the raw collection (there is no need
		// to worry about additional operations in queryLog).
		this.set('messages', (<any> this._stashedMessages).search(this._masterSearchValue, filter));
	}

	protected _messageSort:string;
	_messageSortGetter():string {
		return this._messageSort;
	}
	_messageSortSetter(value:string):void {
		var filter = sortByMap[value];
		this._messageSort = value;

		if (filter) {
			var kwArgs = { sortColumn: filter.column, sortOrder: filter.order };
			this.set('messages', this._messages.filter(kwArgs));

			if (this._stashedMessages) {
				// The sort should be preserved when going back and forth between "all messages" and
				// the other message filters.
				this._stashedMessages = this._stashedMessages.filter(kwArgs);
			}
		}
	}

	protected _searchResultCount:number;
	protected _searchTimer:IHandle;
	protected _showConversation:boolean;
	protected _showNoResultsMessage:boolean;

	_stateClassesDependencies():string[] {
		return [ 'isInCompositionMode', 'isInSearchMode' ];
	}
	_stateClassesGetter():string {
		var isInSearchMode = this.get('isInSearchMode');
		var isInCompositionMode = this.get('isInCompositionMode');
		var classes:string = (isInSearchMode || isInCompositionMode) ? 'has-overlay' : '';

		if (isInCompositionMode) {
			classes += ' is-inCompositionMode';
		}

		return classes;
	}

	constructor(kwArgs:HashMap<any>) {
		super(kwArgs);

		this._registerBindings();
	}

	destroy():void {
		super.destroy();
		this._folder = null;
		this._message = null;
		this._compositionMessage = null;
		this._compositionMessageSource = null;
		this._searchTimer && this._searchTimer.remove();
		this._lastUpdatedHandle && this._lastUpdatedHandle.remove();
		this._bindingHandles.forEach(function (handle:IHandle):void {
			handle.remove();
		});
	}

	_initialize() {
		super._initialize();

		this._bindingHandles = [];
		this._isActionsVisible = false;
		this._isFetching = false;
		this._isInboxZeroVisible = false;
		this._isInCompositionMode = false;
		this._isMessageListVisible = true;
		this._isSidebarVisible = false;
		this._lastUpdatedDisplay = '';
		// Set to null so that isInboxZeroVisible doesn't get set to `true` until the message
		// counts are manually set to a number.
		this._messageCount = null;
		this._searchResultCount = null;
		this._showConversation = false;
	}

	protected _registerBindings():void {
		var app:WebApplication = <any> this.get('app');
		var binder:bindings.IBinder = <any> app.get('binder');
		this._bindingHandles = [];

		this._bindingHandles.push(binder.bind({
			source: app,
			sourcePath: 'isMessageListInSelectionMode',
			target: this,
			targetPath: 'isActionsVisible'
		}));

		this._bindingHandles.push(binder.createBinding(this, 'isInSearchMode')
			.observe((change:bindings.IChangeRecord<boolean>):void => {
				var messageFiltersModel = <any> this.get('messageFiltersModel');

				messageFiltersModel && messageFiltersModel.set('isInSearchMode', change.value);
				this.set('showNoResultsMessage', change.value);
			}));

		// TODO: <if> does not currently work correctly with computed properties,
		// so the following bindings are required.
		[
			'isFetching',
			'masterSearchIsFocused',
			'messageCount',
			'searchResultCount'
		].forEach((property:string):void => {
			this._bindingHandles.push(binder.createBinding(this, property)
				.observe(lang.hitch(this, '_setVisibility')));
		});
	}

	protected _resetState():void {
		this.set({
			isInCompositionMode: false,
			masterSearchValue: '',
			showNoResultsMessage: false
		});
	}

	protected _searchMessages(search:string, type:string = 'people'):void {
		if (!search) {
			this.set('messages', this._stashedMessages);
			this._stashedMessages = null;
		}
		else {
			if (!this._stashedMessages) {
				this._stashedMessages = this._messages;
			}

			this.set('messages', (<any> this._stashedMessages).search(search, type));
		}
	}

	protected _setVisibility():void {
		var filter:string = this.get('messageFilter');
		var count = this.get('isInSearchMode') ? this._searchResultCount : this._messageCount;
		var isMessageListVisible = this._isFetching || count || (filter && filter !== 'allMessages');
		var isInboxZeroVisible = !count && !this._isFetching;

		if (this.get('masterSearchIsFocused')) {
			if (!this.get('masterSearchValue')) {
				isMessageListVisible = isInboxZeroVisible = false;
			}
			else if (this._isFetching) {
				isMessageListVisible = true;
				isInboxZeroVisible = false;
			}
		}

		this.set('isMessageListVisible', Boolean(isMessageListVisible));
		this.set('isInboxZeroVisible', isInboxZeroVisible);
	}

}

module Inbox {
	export interface Getters extends Observable.Getters {
		(key:'compositionAction'):string;
		(key:'compositionMessage'):Message;
		(key:'compositionMessageSource'):Message;
		(key:'conversations'):dstore.ICollection<Conversation>;
		(key:'folder'):Folder;
		(key:'isActionsVisible'):boolean;
		(key:'isFetching'):boolean;
		(key:'isInboxZeroVisible'):boolean;
		(key:'isInCompositionMode'):boolean;
		(key:'isInSearchMode'):boolean;
		(key:'isMessageListVisible'):boolean;
		(key:'isSidebarVisible'):boolean;
		(key:'lastUpdated'):Date;
		(key:'lastUpdatedDisplay'):string;
		(key:'masterSearchIsFocused'):boolean;
		(key:'masterSearchValue'):string;
		(key:'message'):Message;
		(key:'messageActionsModel'):MessageActionsViewModel;
		(key:'messageConnectionsFilter'):Connection[];
		(key:'messageCount'):number;
		(key:'messageCountDisplay'):string;
		(key:'messageFilter'):string;
		(key:'messageFiltersModel'):MessageFiltersViewModel;
		(key:'messages'):dstore.ICollection<Message>;
		(key:'messageSearchFilter'):string;
		(key:'messageSort'):string;
		(key:'searchResultCount'):number;
		(key:'showConversation'):boolean;
		(key:'showNoResultsMessage'):boolean
		(key:'stateClasses'):string;
	}

	export interface Setters extends Observable.Setters {
		(key:'compositionAction', value:string):void;
		(key:'compositionMessage', value:Message):void;
		(key:'compositionMessageSource', value:Message):void;
		(key:'conversations', value:dstore.ICollection<Conversation>):void;
		(key:'folder', value:Folder):void;
		(key:'isActionsVisible', value:boolean):void;
		(key:'isFetching', value:boolean):void;
		(key:'isInboxZeroVisible', value:boolean):void;
		(key:'isInCompositionMode', value:boolean):void;
		(key:'isMessageListVisible', value:boolean):void;
		(key:'isSidebarVisible', value:boolean):void;
		(key:'lastUpdated', value:Date):void;
		(key:'masterSearchIsFocused', value:boolean):void;
		(key:'masterSearchValue', value:string):void;
		(key:'message', value:Message):void;
		(key:'messageActionsModel', value:MessageActionsViewModel):void;
		(key:'messageConnectionsFilter', value:Connection[]):void;
		(key:'messageCount', value:number):void;
		(key:'messageFilter', value:string):void;
		(key:'messageFiltersModel', value:MessageFiltersViewModel):void;
		(key:'messages', value:dstore.ICollection<Message>):void;
		(key:'messageSearchFilter', value:string):void;
		(key:'messageSort', value:string):void;
		(key:'searchResultCount', value:number):void;
		(key:'showConversation', value:boolean):void;
		(key:'showNoResultsMessage', value:boolean):void;
	}
}

export = Inbox;
