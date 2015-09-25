define(["require", "exports", 'mayhem/Event', 'dojo/_base/lang', '../util', "mayhem/templating/html!app/ui/messages/MessageFilters.html"], function (require, exports, Event, lang, uiUtil) {
    var MessageFilters = require('mayhem/templating/html!app/ui/messages/MessageFilters.html');
    var _render = MessageFilters.prototype._render;
    MessageFilters.prototype._render = function () {
        var _this = this;
        _render.call(this);
        this.on('messageConnectionListChange', function (event) {
            _this.get('model').set('selectedConnections', event.target);
            _this._emit('messageFilterConnectionsSelect');
        });
        this.on('messageConnectionListClosed', function (event) {
            _this.get('model').set('isOpen', false);
        });
        this.on('activate', lang.hitch(this, 'selectFilter'));
    };
    MessageFilters.prototype.toggleMenu = function () {
        var model = this.get('model');
        model.set('isOpen', !model.get('isOpen'));
    };
    MessageFilters.prototype.selectFilter = function (event) {
        var clicked = event.target;
        var type = clicked.get('actionType');
        var value = clicked.get('actionValue');
        if (type && value) {
            var model = this.get('model');
            var suffix = type.charAt(0).toUpperCase() + type.slice(1);
            var property = 'selected' + suffix;
            model.set(property, value);
            model.set('isOpen', false);
            uiUtil.closeDropDowns(event.target);
            this._emit('message' + suffix + 'Select');
        }
    };
    MessageFilters.prototype._emit = function (type) {
        if (type) {
            this.emit(new Event({
                type: type,
                bubbles: true,
                cancelable: false,
                target: this
            }));
        }
    };
    return MessageFilters;
});
//# sourceMappingURL=MessageFilters.js.map