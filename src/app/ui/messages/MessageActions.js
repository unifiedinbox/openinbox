define(["require", "exports", 'mayhem/Event', '../util', "mayhem/templating/html!./MessageActions.html"], function (require, exports, Event, uiUtil) {
    var MessageActions = require('mayhem/templating/html!./MessageActions.html');
    MessageActions.prototype._selectedActionEventName = 'messageActionSelected';
    MessageActions.prototype._hasOpenDropDown = false;
    var _render = MessageActions.prototype._render;
    MessageActions.prototype._render = function () {
        var _this = this;
        _render.call(this);
        var app = this.get('app');
        this.on('activate', function (event) {
            var widget = event.target;
            var action = widget.get('action');
            var eventName = _this._selectedActionEventName;
            if (action) {
                uiUtil.closeDropDowns(widget);
            }
            if (action === 'archive' || action === 'trash') {
                var folders = app.get('user').get('folders');
                var folderName = (action === 'archive') ? 'Archive' : 'Trash';
                folders && folders.filter({ name: folderName }).fetch().then(function (folders) {
                    var folder = folders[0];
                    var folderId = folder && folder.get('id');
                    _this._emit(eventName, { property: 'folderId', value: folderId });
                });
            }
            else {
                _this._emit(eventName, { property: action, value: widget.get('actionValue') });
            }
        });
        this.on('folderSelected', function (event) {
            var folder = event.target.get('model');
            event.stopPropagation();
            uiUtil.closeDropDowns(event.target);
            _this._emit(_this._selectedActionEventName, { property: 'folderId', value: folder && folder.get('id') });
        });
        this.on('dropDownOpen', function (event) {
            _this.set('hasOpenDropDown', true);
        });
    };
    MessageActions.prototype._emit = function (type, target) {
        if (type && target) {
            this.emit(new Event({
                type: type,
                bubbles: true,
                cancelable: false,
                target: target
            }));
        }
    };
    MessageActions.prototype.reset = function (detach) {
        this.get('model').set({
            isOpen: false,
            folderSearch: ''
        });
        if (detach) {
            this.set('parent', null);
        }
    };
    return MessageActions;
});
//# sourceMappingURL=MessageActions.js.map