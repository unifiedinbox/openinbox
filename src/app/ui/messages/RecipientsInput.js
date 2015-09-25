var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'dojo/aspect', 'dojo/on', 'mayhem/Event', 'mayhem/Promise', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util', 'dstore/Memory', '../../models/Connection', '../connections/ConnectionList', '../../models/Contact', '../search/MasterSearch', '../../models/Recipient', '../../viewModels/Recipients', '../../models/stores/TrackableMemory', '../../util', "mayhem/templating/html!./RecipientsList.html"], function (require, exports, aspect, on, Event, Promise, SingleNodeWidget, util, Memory, Connection, ConnectionList, Contact, MasterSearch, Recipient, RecipientsViewModel, TrackableMemory, appUtil) {
    var RecipientsList = require('mayhem/templating/html!./RecipientsList.html');
    var RecipientsInput = (function (_super) {
        __extends(RecipientsInput, _super);
        function RecipientsInput(kwArgs) {
            util.deferSetters(this, ['contactsCollection'], '_render');
            _super.call(this, kwArgs);
        }
        RecipientsInput.prototype._contactsCollectionGetter = function () {
            return this._contactsCollection;
        };
        RecipientsInput.prototype._contactsCollectionSetter = function (collection) {
            this._contactsCollection = collection;
            this._masterSearch.set('collection', collection);
        };
        RecipientsInput.prototype._isAttachedGetter = function () {
            return this._isAttached;
        };
        RecipientsInput.prototype._isAttachedSetter = function (isAttached) {
            this._isAttached = isAttached;
            this._masterSearch.set('isAttached', isAttached);
            this._recipientsList.set('isAttached', isAttached);
            this._connectionList.set('isAttached', isAttached);
        };
        RecipientsInput.prototype._isConnectionListOpenGetter = function () {
            return this._isConnectionListOpen;
        };
        RecipientsInput.prototype._isConnectionListOpenSetter = function (isOpen) {
            this._isConnectionListOpen = isOpen;
            this._connectionList.get('firstNode').classList.toggle('is-open', isOpen);
            this._connectionListCloseHandle[isOpen ? 'resume' : 'pause']();
        };
        RecipientsInput.prototype._valueGetter = function () {
            return this._recipientsCollection.fetchSync().map(function (recipient) {
                return recipient.get('contact').get('accounts')[recipient.get('selectedAccount')].address;
            });
        };
        RecipientsInput.prototype._valueSetter = function (values) {
            var app = this.get('app');
            var recipientsStore = this._recipientsCollection;
            appUtil.removeAll(recipientsStore).then(function () {
                if (values) {
                    values.forEach(function (value) {
                        recipientsStore.add(new Recipient({
                            app: app,
                            contact: new Contact({
                                app: app,
                                displayName: value,
                                accounts: [{ address: value }]
                            }),
                            selectedAccount: 0
                        }));
                    });
                }
            });
        };
        RecipientsInput.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._recipientsCollection = new TrackableMemory();
        };
        RecipientsInput.prototype._registerEvents = function () {
            var _this = this;
            function stopPropagation(event) {
                event.stopPropagation();
            }
            var masterSearch = this._masterSearch;
            var ui = this.get('app').get('ui');
            masterSearch.on('keydown', this._handleSearchKeyboardEvent.bind(this));
            masterSearch.on('searchSubmit', this._handleSearchSubmitEvent.bind(this));
            masterSearch.on('masterSearchChange', stopPropagation);
            masterSearch.on('masterSearchFocus', stopPropagation);
            masterSearch.on('masterSearchSubmit', stopPropagation);
            masterSearch.on('searchResultSelected', stopPropagation);
            this.on('activate', this._handleActivate.bind(this));
            this._connectionListCloseHandle = on.pausable(ui, 'pointerdown', function (event) {
                if (!appUtil.contains(_this._connectionList, event.target)) {
                    _this.set('isConnectionListOpen', false);
                    event.stopPropagation();
                    event.preventDefault();
                }
            });
        };
        RecipientsInput.prototype._render = function () {
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
            var connectionList = this._connectionList = new ConnectionList({
                app: app,
                parent: this
            });
            connectionList.get('firstNode').classList.add('ConnectionList--recipient');
            node.appendChild(recipientsList.detach());
            node.appendChild(masterSearch.detach());
            document.body.appendChild(connectionList.detach());
            this._registerEvents();
        };
        RecipientsInput.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._masterSearch.destroy();
            this._recipientsList.destroy();
            this._connectionList.destroy();
            this._connectionListCloseHandle.remove();
        };
        RecipientsInput.prototype._emit = function (type, recipient) {
            var event = new RecipientsInput.RecipientEvent({
                type: type,
                bubbles: true,
                cancelable: false,
                target: this
            });
            event.item = recipient;
            this.emit(event);
        };
        RecipientsInput.prototype._handleActivate = function (event) {
            var target = event.target;
            if (!appUtil.contains(this._masterSearch, target) && !appUtil.contains(this._connectionList, target)) {
                this._masterSearch.set('isFocused', true);
            }
        };
        RecipientsInput.prototype._handleSearchKeyboardEvent = function (event) {
            var _this = this;
            var recipientsStore = this._recipientsCollection;
            if (event.code === 'Backspace' && !this._masterSearch.get('search')) {
                recipientsStore.fetch().then(function (recipients) {
                    var lastRecipient = recipients[recipients.length - 1];
                    if (lastRecipient) {
                        recipientsStore.remove(recipientsStore.getIdentity(lastRecipient));
                        _this._emit('recipientRemoved', lastRecipient);
                    }
                });
            }
            if (event.code !== 'Enter' && this._isConnectionListOpen) {
                this.set('isConnectionListOpen', false);
            }
        };
        RecipientsInput.prototype._handleSearchSubmitEvent = function (event) {
            var _this = this;
            event.stopPropagation();
            var app = this.get('app');
            var accounts = event.item && event.item.get('accounts');
            var selectedAccountPromise;
            if (!accounts || accounts.length === 1) {
                selectedAccountPromise = Promise.resolve(0);
            }
            else {
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
                    var row = connectionRow.get('firstNode');
                    return Array.prototype.indexOf.call(row.parentNode.children, row) - 1;
                });
            }
            var contact = event.item ? event.item : new Contact({
                app: app,
                displayName: event.value,
                accounts: [{ address: event.value }]
            });
            selectedAccountPromise.then(function (selectedAccount) {
                var recipient = new Recipient({
                    app: app,
                    contact: contact,
                    selectedAccount: selectedAccount
                });
                _this._recipientsCollection.add(recipient);
                _this._emit('recipientAdded', recipient);
                _this._masterSearch.set('search', '');
            }, function () {
            });
        };
        RecipientsInput.prototype._promptConnectionList = function (kwArgs) {
            var _this = this;
            var connectionList = this._connectionList;
            connectionList.set(kwArgs);
            appUtil.positionNode(connectionList.get('firstNode'), this._masterSearch.get('firstNode'));
            this.set('isConnectionListOpen', true);
            return new Promise(function (resolve, reject) {
                var successHandle = on.once(connectionList, 'connectionSelected', function (event) {
                    resolve(event.target);
                    failureHandle.remove();
                    _this.set('isConnectionListOpen', false);
                    _this._masterSearch.set('isFocused', true);
                });
                var failureHandle = aspect.before(_this, '_isConnectionListOpenSetter', function (isOpen) {
                    if (!isOpen) {
                        reject(new Error('User canceled connection selection'));
                        successHandle.remove();
                        failureHandle.remove();
                    }
                });
            });
        };
        return RecipientsInput;
    })(SingleNodeWidget);
    var RecipientsInput;
    (function (RecipientsInput) {
        var RecipientEvent = (function (_super) {
            __extends(RecipientEvent, _super);
            function RecipientEvent() {
                _super.apply(this, arguments);
                this.item = null;
            }
            return RecipientEvent;
        })(Event);
        RecipientsInput.RecipientEvent = RecipientEvent;
    })(RecipientsInput || (RecipientsInput = {}));
    return RecipientsInput;
});
//# sourceMappingURL=RecipientsInput.js.map