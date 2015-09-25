define(["require", "exports", 'app/endpoints', 'dojo/_base/lang', 'dojo/request/registry', './util', "./data/showConversation"], function (require, exports, endpoints, lang, registry, util) {
    var conversationData = require('./data/showConversation');
    registry.register(endpoints.showConversation, function (url, options) {
        return util.delay({
            response: [{
                data: conversationData.map(function (item) {
                    return lang.mixin({}, item, {
                        msg_index: String(options.data.msgIndx || 0)
                    });
                })
            }]
        });
    });
});
//# sourceMappingURL=showConversation.js.map