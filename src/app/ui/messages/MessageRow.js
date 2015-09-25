var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../../util', 'mayhem/Event', 'dojo/_base/lang', "mayhem/templating/html!./MessageRow.html"], function (require, exports, appUtil, Event, lang) {
    var MessageRow = require('mayhem/templating/html!./MessageRow.html');
    var destroy = MessageRow.prototype.destroy;
    MessageRow.prototype.destroy = function () {
        destroy.call(this);
        this._ownBindingHandles.forEach(function (handle) {
            handle.remove();
        });
    };
    var _initialize = MessageRow.prototype._initialize;
    MessageRow.prototype._initialize = function () {
        var _this = this;
        _initialize.call(this);
        this._ownBindingHandles = [];
        this.on('messageActionSelected', function (event) {
            var property = event.target.property;
            event.stopPropagation();
            if (property) {
                _this.get('model').set(property, event.target.value);
                if (property === 'compositionAction') {
                    _this.emit(new MessageEvent({
                        type: 'messageCompose',
                        bubbles: true,
                        cancelable: false,
                        target: _this,
                        source: appUtil.getProxyTarget(_this.get('model')),
                        action: event.target.value
                    }));
                }
                else if (property === 'folderId') {
                    _this.detach();
                    _this._emit('messageRowFolderChange');
                }
            }
        });
        this.on('pointerenter', lang.hitch(this, '_emit', 'messageRowPointerEnter'));
        this.on('pointerleave', lang.hitch(this, '_emit', 'messageRowPointerLeave'));
    };
    var _render = MessageRow.prototype._render;
    MessageRow.prototype._render = function () {
        var _this = this;
        _render.call(this);
        var binder = this.get('app').get('binder');
        this._ownBindingHandles.push(binder.createBinding(this.get('app'), 'isInSearchMode').observe(function (change) {
            var model = _this.get('model');
            if (model) {
                model.set('showAttachments', change.value && model.get('hasAttachment'));
            }
        }));
    };
    MessageRow.prototype.selectMessage = function (event) {
        if (event.target.get('name') !== 'messageRowActions') {
            this._emit('messageSelected');
        }
    };
    MessageRow.prototype.toggleStar = function (event) {
        var model = this.get('model');
        model.set('isStarred', !model.get('isStarred'));
        event.stopPropagation();
    };
    MessageRow.prototype.toggleSelected = function (event) {
        var model = this.get('model');
        model.set('isSelected', !model.get('isSelected'));
        event.stopPropagation();
    };
    MessageRow.prototype._emit = function (type, event) {
        this.emit(new Event({
            type: type,
            bubbles: true,
            cancelable: false,
            target: this,
            relatedTarget: event && event.relatedTarget || null
        }));
    };
    var MessageEvent = (function (_super) {
        __extends(MessageEvent, _super);
        function MessageEvent() {
            _super.apply(this, arguments);
        }
        return MessageEvent;
    })(Event);
    MessageRow.MessageEvent = MessageEvent;
    return MessageRow;
});
//# sourceMappingURL=MessageRow.js.map