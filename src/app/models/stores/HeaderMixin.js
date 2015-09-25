define(["require", "exports", 'dojo/_base/declare'], function (require, exports, declare) {
    var HeaderMixin = declare(null, {
        _getAppHeaders: function () {
            if (typeof this.app === 'string') {
                this.app = require(this.app);
            }
            var user = this.app.get('user');
            return {
                apikey: this.app.get('apikey'),
                sessionId: user.get('sessionId'),
                app: user.get('uibApplication')
            };
        }
    });
    return HeaderMixin;
});
//# sourceMappingURL=HeaderMixin.js.map