/// <amd-dependency path="./data/getAllMessages" />

import endpoints = require('app/endpoints');
import registry = require('dojo/request/registry');
import Promise = require('mayhem/Promise');

var messageData:any = require('./data/getAllMessages');

function respond(url:string, options:any) {
	console.log(url, options);
	// Placeholder to resolve a promise for each command service.
	// TODO: These should actually update the mock message data if we want to really test with it locally.
	return Promise.resolve(<any> { response: [] });
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
