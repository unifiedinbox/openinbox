define(["require", "exports", '../util', "mayhem/templating/html!./ConversationRow.html"], function (require, exports, uiUtil) {
    var ConversationRow = require('mayhem/templating/html!./ConversationRow.html');
    var _render = ConversationRow.prototype._render;
    ConversationRow.prototype._render = function () {
        _render.call(this);
        this.on('activate', function (event) {
            var widget = event.target;
            uiUtil.closeDropDowns(widget);
        });
    };
    return ConversationRow;
});
//# sourceMappingURL=ConversationRow.js.map