var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../models/Contact', '../models/Message', './NewMessage'], function (require, exports, Contact, Message, NewMessageProxy) {
    var priorityMap = {
        2: 'high',
        3: 'standard',
        4: 'low'
    };
    var MessageComposition = (function (_super) {
        __extends(MessageComposition, _super);
        function MessageComposition() {
            _super.apply(this, arguments);
        }
        MessageComposition.prototype._contactsGetter = function () {
            return Contact.store;
        };
        MessageComposition.prototype._draftSaveOnCloseClassDependencies = function () {
            return ['draftSaveOnClose'];
        };
        MessageComposition.prototype._draftSaveOnCloseClassGetter = function () {
            return this._draftSaveOnClose ? '' : 'dijitHidden';
        };
        MessageComposition.prototype._highPriorityClassDependencies = function () {
            return ['priority'];
        };
        MessageComposition.prototype._highPriorityClassGetter = function () {
            return this.get('priority') === 2 /* High */ ? 'selected' : '';
        };
        MessageComposition.prototype._lowPriorityClassDependencies = function () {
            return ['priority'];
        };
        MessageComposition.prototype._lowPriorityClassGetter = function () {
            return this.get('priority') === 4 /* Low */ ? 'selected' : '';
        };
        MessageComposition.prototype._priorityLabelDependencies = function () {
            return ['priority'];
        };
        MessageComposition.prototype._priorityLabelGetter = function () {
            var messages = this.get('app').get('i18n').get('messages');
            var method = priorityMap[this.get('priority')];
            return method ? messages[method]() : '';
        };
        MessageComposition.prototype._showBccClassDependencies = function () {
            return ['showCc', 'showBcc'];
        };
        MessageComposition.prototype._showBccClassGetter = function () {
            return this._showCc && this._showBcc ? '' : 'dijitHidden';
        };
        MessageComposition.prototype._showBccToggleClassDependencies = function () {
            return ['showCc', 'showBcc'];
        };
        MessageComposition.prototype._showBccToggleClassGetter = function () {
            return this._showCc && this._showBcc ? 'dijitHidden' : '';
        };
        MessageComposition.prototype._showCcClassDependencies = function () {
            return ['showCc'];
        };
        MessageComposition.prototype._showCcClassGetter = function () {
            return this._showCc ? '' : 'dijitHidden';
        };
        MessageComposition.prototype._showCcToggleClassDependencies = function () {
            return ['showCc'];
        };
        MessageComposition.prototype._showCcToggleClassGetter = function () {
            return this._showCc ? 'dijitHidden' : '';
        };
        MessageComposition.prototype._showPriorityClassDependencies = function () {
            return ['showPriority'];
        };
        MessageComposition.prototype._showPriorityClassGetter = function () {
            return this._showPriority ? '' : 'dijitHidden';
        };
        MessageComposition.prototype._standardPriorityClassDependencies = function () {
            return ['priority'];
        };
        MessageComposition.prototype._standardPriorityClassGetter = function () {
            return this.get('priority') === 3 /* Normal */ ? 'selected' : '';
        };
        MessageComposition.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this.set({
                draftSaveOnClose: false,
                showBcc: false,
                showCc: false,
                showPriority: false,
            });
        };
        return MessageComposition;
    })(NewMessageProxy);
    return MessageComposition;
});
//# sourceMappingURL=MessageComposition.js.map