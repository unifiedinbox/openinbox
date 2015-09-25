var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'dojo/_base/declare', 'dstore/Memory', 'dstore/Trackable', 'mayhem/data/PersistentModel'], function (require, exports, declare, Memory, Trackable, PersistentModel) {
    var TrackableMemory = declare([Memory, Trackable]);
    var Comment = (function (_super) {
        __extends(Comment, _super);
        function Comment() {
            _super.apply(this, arguments);
        }
        Comment.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._date = new Date();
            this._message = '';
        };
        return Comment;
    })(PersistentModel);
    var Comment;
    (function (Comment) {
        ;
        ;
    })(Comment || (Comment = {}));
    Comment.setDefaultApp('app/main');
    Comment.setDefaultStore(new TrackableMemory());
    return Comment;
});
//# sourceMappingURL=Comment.js.map