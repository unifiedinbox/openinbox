import Message = require('app/models/Message');

var allProperties:string[] = [
	'attachments',
	'avatar',
	'bcc',
	'body',
	'cc',
	'commentCount',
	'connectionType',
	'date',
	'folderId',
	'format',
	'forwarded',
	'from',
	'hasAttachment',
	'id',
	'isJunk',
	'isRead',
	'isStarred',
	'labels',
	'messageType',
	'participants',
	'priority',
	'privacyStatus',
	'readReceipt',
	'replied',
	'replyTo',
	'subject',
	'to',

	// Implemented by SelectionManager...
	'isSelected'
];

var scenarios:HashMap<string[]> = {
	listView: allProperties
};

Message.prototype._scenarios = scenarios;

export = scenarios;
