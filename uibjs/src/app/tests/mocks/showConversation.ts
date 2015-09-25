/// <amd-dependency path="./data/showConversation" />

import endpoints = require('app/endpoints');
import lang = require('dojo/_base/lang');
import registry = require('dojo/request/registry');
import util = require('./util');

var conversationData:any = require('./data/showConversation');

registry.register(endpoints.showConversation, function (url:string, options:any) {
	return util.delay({
		response: [ {
			data: conversationData.map(function (item:any) {
				return lang.mixin({}, item, {
					msg_index: String(options.data.msgIndx || 0)
				});
			})
		} ]
	});
});
