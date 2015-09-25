var apiBase = 'http://apis.unifiedinbox.com/v1/';

var endpoints = {
	apiBase: apiBase,
	login: apiBase + 'System/Auth/login',
	logout: apiBase + 'System/Auth/logout',
	forgotPassword: 'http://login.beta.unifiedinbox.com/password/forgot',
	register: 'http://unifiedinbox.com/get/',

	getContactsList: apiBase + 'Search/Contact/getContactsList',
	getAllFolders: apiBase + 'Folder/ListFolder/getAllFolders',
	getAllMessages: apiBase + 'Message/Filter/getAllMessages',
	getAttachments: apiBase + 'Message/Email/getAttachments',
	getMessageCounts: apiBase + 'Message/Email/getMessageCounts',
	archiveMessage: apiBase + 'Message/Commands/archive',
	moveToFolder: apiBase + 'Message/Commands/moveTo',
	markAsStarred: apiBase + 'Message/Email/markMsgAsStarred',
	markAsJunk: apiBase + 'Message/Commands/markAsJunk',
	markAsNotJunk: apiBase + 'Message/Commands/markAsNotJunk',
	markAsRead: apiBase + 'Message/Commands/markAsRead',
	markAsUnread: apiBase + 'Message/Commands/markAsUnread',
	blacklistSender: apiBase + 'Message/Commands/blackListSender',
	whitelistSender: apiBase + 'Message/Commands/markAsSecure',
	forwardMessage: apiBase + 'Message/Email/forward',
	deleteMessage: apiBase + 'Message/Email/deleteMessages',
	replyMessage: apiBase + 'Message/Email/reply',
	sendMessage: apiBase + 'Message/Email/send',
	saveAsDraft: apiBase + 'Message/Email/saveAsDraft',

	showConversation: apiBase + 'Message/Email/showConversation',
	getSourceFilter: apiBase + 'Message/Email/getSourceFilter',

	notifications: apiBase + 'Notifications/Notifications/getNotifications',
	boshService: 'http://app.unifiedinbox.com/xmpp-httpbind/',
	// TODO: remove '.beta' when the service is available on the main application
	boshHttpService: 'http://app.beta.unifiedinbox.com:7070/http-bind/',
	// TODO: replace this with a real endpoint, one wasn't provided
	viewMessageSource: 'http://app.beta.unifiedinbox.com:7070/messages'
};

export = endpoints;
