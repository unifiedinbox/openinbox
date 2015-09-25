/// <amd-dependency path="./data/getAllMessages" />

import endpoints = require('app/endpoints');
import registry = require('dojo/request/registry');
import util = require('./util');

var messageData:any = require('./data/getAllMessages');

registry.register(endpoints.getAllMessages, function (url:string, options:any) {
	var endIndex = Math.min(options.data.startrecord + options.data.limit, messageData.length);
	var data = <any> options.data;
	var filters:string = data.ViewStandardFilters;
	var filtered = !filters ? messageData :
		messageData.filter(function (object:any):boolean {
			// For the "My Messages" filter, just use an arbitrary assignee.
			return (filters[0] === 'mymessages') ? (object.assigned_to === '4968') : (object.status === 'false');
		});

	// mimic "from" search
	if (data.searchPattern) {
		filtered = filtered.filter(function (object:any):boolean {
			return object.from.toLowerCase().indexOf(data.searchPattern.toLowerCase()) > -1;
		});
	}

	// mimic sort; assume sorted values will be strings or numbers
	if (data.sortColumn) {
		var column = data.sortColumn;
		var order = data.sortOrder;
		filtered = filtered.sort(function (left:any, right:any):number {
			var leftValue:any = (column === 'date') ? new Date(left[column]) : left[column];
			var rightValue:any = (column === 'date') ? new Date(right[column]) : right[column];

			if (leftValue === rightValue) {
				return 0;
			}

			if (order === 'DESC') {
				return leftValue < rightValue ? 1 : -1;
			}
			else {
				return leftValue < rightValue ? -1 : 1;
			}
		});
	}

	if (typeof data.folderid === 'number') {
		filtered = filtered.filter(function (item:any):boolean {
			return item.categoryIndx === String(data.folderid);
		});
	}

	return util.delay({
		response: [
			{
				data: [
					0,
					filtered.slice(data.startrecord, endIndex),
					filtered.length
				]
			}
		]
	});
});

registry.register(endpoints.getMessageCounts, function (url:string, options:any) {
	return util.delay({
		response: [ {
			data: {
				total_message_count: '1574',
				unread_message_count: '1533',
				my_message_count: '89',
				new_message_count: '53'
			}
		} ]
	});
});
