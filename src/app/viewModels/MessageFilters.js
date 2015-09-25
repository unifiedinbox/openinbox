var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Observable', 'mayhem/Promise'], function (require, exports, Observable, Promise) {
    var MessageFilters = (function (_super) {
        __extends(MessageFilters, _super);
        function MessageFilters() {
            _super.apply(this, arguments);
        }
        MessageFilters.prototype._countsDependencies = function () {
            return ['isOpen'];
        };
        MessageFilters.prototype._countsGetter = function () {
            var _this = this;
            if (!this.get('isOpen')) {
                return Promise.resolve(this._lastCounts || {});
            }
            else {
                var countsPromise = this.get('messages').getMessageCounts();
                return countsPromise.then(function (counts) {
                    _this._lastCounts = Object.keys(counts).reduce(function (data, key) {
                        var count = counts[key];
                        if (count) {
                            data[key] = ' (' + String(count) + ')';
                        }
                        return data;
                    }, {});
                    return _this._lastCounts;
                });
            }
        };
        MessageFilters.prototype._isInSearchModeGetter = function () {
            return this._isInSearchMode;
        };
        MessageFilters.prototype._isInSearchModeSetter = function (value) {
            this._isInSearchMode = value;
            if (value) {
                this.set('isOpen', true);
            }
        };
        MessageFilters.prototype._isOpenGetter = function () {
            return this._isOpen;
        };
        MessageFilters.prototype._isOpenSetter = function (value) {
            this._isOpen = this._isInSearchMode ? true : value;
        };
        MessageFilters.prototype._linkTextDependencies = function () {
            return ['selectedFilter', 'selectedSort'];
        };
        MessageFilters.prototype._linkTextGetter = function () {
            var app = this.get('app');
            var messages = app.get('i18n').get('messages');
            return messages.filterBarLabel({
                filter: this.get('selectedFilterLabel'),
                sort: this.get('selectedSortLabel')
            });
        };
        MessageFilters.prototype._searchActionsGetter = function () {
            var app = this.get('app');
            var messages = app && app.get('i18n').get('messages');
            return !this._searchActions ? [] : this._searchActions.reduce(function (actions, action) {
                var message = messages && messages[action];
                if (typeof message === 'function') {
                    actions.push({ filter: action, text: message() });
                }
                return actions;
            }, []);
        };
        MessageFilters.prototype._searchActionsSetter = function (value) {
            this._searchActions = value;
        };
        MessageFilters.prototype._selectedFilterLabelDependencies = function () {
            return ['selectedFilter'];
        };
        MessageFilters.prototype._selectedFilterLabelGetter = function () {
            return this._getLabel(this.get('selectedFilter'));
        };
        MessageFilters.prototype._selectedSortLabelDependencies = function () {
            return ['selectedSort'];
        };
        MessageFilters.prototype._selectedSortLabelGetter = function () {
            return this._getLabel(this.get('selectedSort'));
        };
        MessageFilters.prototype._stateClassesDependencies = function () {
            return ['isInSearchMode', 'isOpen', 'selectedFilter', 'selectedSearchFilter'];
        };
        MessageFilters.prototype._stateClassesGetter = function () {
            var classes = [];
            if (this.get('isInSearchMode')) {
                classes.push('is-inSearchMode', 'is-open');
                if (this.get('selectedSearchFilter')) {
                    classes.push('is-filtered--' + this.get('selectedSearchFilter'));
                }
            }
            else {
                classes.push((this.get('isOpen') ? 'is-open' : 'is-closed'));
                if (this.get('selectedFilter')) {
                    classes.push('is-filtered--' + this.get('selectedFilter'));
                }
            }
            return classes.join(' ');
        };
        MessageFilters.prototype._initialize = function () {
            this._counts = null;
            this._linkText = this._selectedFilterLabel = this._selectedSortLabel = this._stateClasses = '';
            this.set({
                isInSearchMode: false,
                isOpen: false,
                messages: null,
                searchActions: ['allResults', 'from', 'to', 'subject', 'attachments'],
                selectedConnections: null,
                selectedFilter: 'allMessages',
                selectedSearchFilter: 'allResults',
                selectedSort: 'date'
            });
        };
        MessageFilters.prototype._getLabel = function (filter) {
            var app = this.get('app');
            var messages = app.get('i18n').get('messages');
            return messages[filter]();
        };
        return MessageFilters;
    })(Observable);
    return MessageFilters;
});
//# sourceMappingURL=MessageFilters.js.map