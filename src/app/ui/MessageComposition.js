var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/Event', '../models/Message', '../models/stores/Message', '../ui/util', "mayhem/templating/html!./messages/AttachmentPreviews.html", "mayhem/templating/html!./MessageComposition.html"], function (require, exports, Event, Message, MessageStore, uiUtil) {
    MessageStore;
    var AttachmentPreviews = require('mayhem/templating/html!./messages/AttachmentPreviews.html');
    var MessageComposition = require('mayhem/templating/html!./MessageComposition.html');
    var _render = MessageComposition.prototype._render;
    MessageComposition.prototype._render = function () {
        _render.call(this);
        var model = this.get('model');
        this.on('folderSelected', this._handleFolderSelection.bind(this));
        this.on('updateRecipients', this._handleUpdateRecipients.bind(this));
        this.on('recipientAdded', this._updateRecipientField.bind(this));
        this.on('recipientRemoved', this._updateRecipientField.bind(this));
        this.set('attachmentsWidget', new AttachmentPreviews({
            app: this.get('app'),
            parent: this,
            model: model.get('attachmentsModel')
        }));
    };
    MessageComposition.prototype._updateRecipientField = function (event) {
        var input = event.target;
        var field = input.get('id');
        var value = input.get('value');
        if (field && value) {
            this.get('model').set(field, value);
        }
    };
    MessageComposition.prototype._handleFolderSelection = function (event) {
        var folder = event.target.get('model');
        var model = this.get('model');
        event.stopPropagation();
        model.set('selectedFolder', folder);
        uiUtil.closeDropDowns(event.target);
    };
    MessageComposition.prototype._handleUpdateRecipients = function (event) {
        var viewModel = this.get('model');
        var recipientList = event.target;
        var selectedRecipients = recipientList.get('value');
        var currentRecipients = viewModel.get('selectedRecipients').slice();
        if (!this._isDefaultRecipientsSet) {
            this._isDefaultRecipientsSet = true;
            viewModel.set('selectedRecipients', currentRecipients);
        }
        else {
            selectedRecipients.fetch().then(function (contacts) {
                viewModel.set('selectedRecipients', contacts);
            });
        }
    };
    MessageComposition.prototype.send = function (event) {
        var model = this.get('model');
        var moveToFolder = model.get('selectedFolder');
        var message = (model.get('source') || model.get('target'));
        this._emit('messageSend');
        this.close();
        if (moveToFolder) {
            message.set('folderId', moveToFolder.get('id'));
        }
    };
    MessageComposition.prototype.close = function () {
        this._emit('messageCompositionClose');
    };
    MessageComposition.prototype.draftSaveOnClose = function (event) {
        var model = this.get('model');
        model.set('draftSaveOnClose', !model.get('draftSaveOnClose'));
    };
    MessageComposition.prototype.highPriority = function () {
        this._setPriority(2 /* High */);
    };
    MessageComposition.prototype.lowPriority = function () {
        this._setPriority(4 /* Low */);
    };
    MessageComposition.prototype.standardPriority = function () {
        this._setPriority(3 /* Normal */);
    };
    MessageComposition.prototype.toggleMoveToFolder = function () {
        var model = this.get('model');
        model.set('moveToFolder', !model.get('moveToFolder'));
    };
    MessageComposition.prototype.togglePriority = function () {
        var model = this.get('model');
        model.set('showPriority', !model.get('showPriority'));
    };
    MessageComposition.prototype.toggleShowCc = function () {
        this.get('model').set({
            showCc: !this._showCc,
            showBcc: false,
            cc: [],
            bcc: []
        });
    };
    MessageComposition.prototype.toggleShowBcc = function () {
        this.get('model').set({
            showBcc: !this._showBcc,
            bcc: []
        });
    };
    MessageComposition.prototype.trash = function () {
        this.get('model').set('draftSaveOnClose', false);
        this._emit('messageCompositionClose');
        this.close();
    };
    MessageComposition.prototype._emit = function (type, event) {
        if (type) {
            this.emit(new MessageEvent({
                type: type,
                bubbles: true,
                cancelable: false,
                target: this,
                message: this.get('model').get('target')
            }));
        }
    };
    MessageComposition.prototype._setPriority = function (priority) {
        this.get('model').set('priority', priority);
        this.togglePriority();
    };
    var MessageEvent = (function (_super) {
        __extends(MessageEvent, _super);
        function MessageEvent() {
            _super.apply(this, arguments);
        }
        return MessageEvent;
    })(Event);
    MessageComposition.MessageEvent = MessageEvent;
    return MessageComposition;
});
//# sourceMappingURL=MessageComposition.js.map