define(["require", "exports", 'app/endpoints', 'dojo/request/registry', 'mayhem/Promise', "./data/getAllMessages"], function (require, exports, endpoints, registry, Promise) {
    var messageData = require('./data/getAllMessages');
    function respond(url, options) {
        console.log(url, options);
        return Promise.resolve({ response: [] });
    }
    registry.register(endpoints.archiveMessage, respond);
    registry.register(endpoints.moveToFolder, respond);
    registry.register(endpoints.markAsStarred, respond);
    registry.register(endpoints.markAsJunk, respond);
    registry.register(endpoints.markAsNotJunk, respond);
    registry.register(endpoints.markAsRead, respond);
    registry.register(endpoints.markAsUnread, respond);
    registry.register(endpoints.blacklistSender, respond);
    registry.register(endpoints.whitelistSender, respond);
    registry.register(endpoints.forwardMessage, respond);
    registry.register(endpoints.deleteMessage, respond);
    registry.register(endpoints.replyMessage, respond);
    registry.register(endpoints.sendMessage, respond);
});
//# sourceMappingURL=messageCommands.js.map