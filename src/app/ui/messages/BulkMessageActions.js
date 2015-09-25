define(["require", "exports", './MessageActions'], function (require, exports, MessageActions) {
    function BulkMessageActions() {
        return MessageActions.apply(this, arguments);
    }
    ;
    BulkMessageActions.prototype = Object.create(MessageActions.prototype);
    BulkMessageActions.prototype._selectedActionEventName = 'bulkMessageActionSelected';
    var _render = BulkMessageActions.prototype._render;
    BulkMessageActions.prototype._render = function () {
        var _this = this;
        _render.call(this);
        this.on('bulkMessageActionSelected', function (event) {
            event.stopPropagation();
            _this.get('app').set('bulkMessageAction', event.target);
        });
    };
    return BulkMessageActions;
});
//# sourceMappingURL=BulkMessageActions.js.map