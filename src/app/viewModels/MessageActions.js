var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'dojo/_base/lang', 'mayhem/Observable'], function (require, exports, lang, Observable) {
    var markAsActions = {
        read: {
            iconClass: 'icon-app-read',
            property: 'isRead',
            displayCondition: false
        },
        unread: {
            iconClass: 'icon-app-unread',
            property: 'isRead',
            displayCondition: true
        },
        junk: {
            iconClass: 'icon-app-spam-shield',
            property: 'isJunk',
            displayCondition: false
        },
        notJunk: {
            iconClass: 'icon-app-spam-shield',
            property: 'isJunk',
            displayCondition: true
        },
        blacklist: {
            iconClass: 'icon-app-remove',
            property: 'isBlacklisted',
            displayCondition: false
        },
        whitelist: {
            iconClass: 'icon-app-whitelist',
            property: 'isBlacklisted',
            displayCondition: true
        }
    };
    var MessageActionsViewModel = (function (_super) {
        __extends(MessageActionsViewModel, _super);
        function MessageActionsViewModel() {
            _super.apply(this, arguments);
        }
        MessageActionsViewModel.getDefaultExcludedFolders = function (folders) {
            var defaults = ['Drafts', 'Outbox', 'Sent', 'Archive'];
            var excluded = [];
            if (folders) {
                folders.forEach(function (folder) {
                    if (defaults.indexOf(folder) === -1) {
                        excluded.push(folder);
                    }
                });
            }
            return excluded.concat(defaults);
        };
        MessageActionsViewModel.prototype._currentFolderNameGetter = function () {
            return this._currentFolderName;
        };
        MessageActionsViewModel.prototype._currentFolderNameSetter = function (value) {
            this._currentFolderName = value;
            this.set('excludedFolders', MessageActionsViewModel.getDefaultExcludedFolders(value && [value]));
        };
        MessageActionsViewModel.prototype._isChildOpenDependencies = function () {
            return ['isOpen'];
        };
        MessageActionsViewModel.prototype._isChildOpenGetter = function () {
            return false;
        };
        MessageActionsViewModel.prototype._markAsActionsDependencies = function () {
            return ['message'];
        };
        MessageActionsViewModel.prototype._markAsActionsGetter = function () {
            var actions = this._markAsActions;
            var app = this.get('app');
            var messages = app && app.get('i18n').get('messages');
            var model = this._message;
            var mapped = actions && actions.reduce(function (actions, name) {
                var action = markAsActions[name];
                if ((name in markAsActions) && (!model || model.get(action.property) === action.displayCondition)) {
                    var message = messages && messages[name];
                    if (typeof message === 'function') {
                        var object = lang.mixin({}, action);
                        object.value = !object.displayCondition;
                        object.text = message();
                        actions.push(object);
                    }
                }
                return actions;
            }, []);
            return mapped;
        };
        MessageActionsViewModel.prototype._markAsActionsSetter = function (value) {
            this._markAsActions = value;
        };
        MessageActionsViewModel.prototype._stateClassesDependencies = function () {
            return ['isOpen'];
        };
        MessageActionsViewModel.prototype._stateClassesGetter = function () {
            return !this._isOpen ? 'is-hidden' : '';
        };
        MessageActionsViewModel.prototype._initialize = function () {
            this.set({
                excludedFolders: MessageActionsViewModel.getDefaultExcludedFolders(),
                hideArchive: false,
                hideFolders: false,
                hideMarkAs: false,
                hideDistribute: false,
                hideMore: false,
                isOpen: false,
                markAsActions: ['read', 'unread', 'junk', 'notJunk', 'blacklist', 'whitelist']
            });
        };
        return MessageActionsViewModel;
    })(Observable);
    return MessageActionsViewModel;
});
//# sourceMappingURL=MessageActions.js.map