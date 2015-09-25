var i18n = {
	root: {
		// Application
		search: 'Search',
		logOut: 'Log out',

		// Header
		title: 'Inbox',
		searchPlaceholder: 'Search for anything...',

		// Connections / connection types
		email: 'E-mail',
		facebook: 'Facebook',
		twitter: 'Twitter',
		linkedin: 'LinkedIn',
		selectAll: 'select all',
		selectNone: 'select none',

		// Conversations
		// TODO: this probably needs something more flexible to truly be localizable
		clickTo: 'Click to',
		or: 'or',

		// Folders
		inbox: 'Inbox',
		drafts: 'Drafts',
		templates: 'Templates',
		outbox: 'Outbox',
		sent: 'Sent',
		trash: 'Trash',
		archive: 'Archive',

		// Folder pane footer
		messages: '{NUM, plural, one {1 message} other {# messages}}',
		lastSync: 'Last sync',

		// Filesize units
		b: 'B',
		kb: 'KB',
		mb: 'MB',
		gb: 'GB',
		tb: 'TB',

		// Login
		username: 'User Name',
		password: 'Password',
		logMeIn: 'Log me in',
		stayLoggedIn: 'Stay logged in',
		registerAccount: 'Register Account',
		resetPassword: 'Reset Password',
		loginFail: 'Wrong username or password!',
		loginError: 'Oops! Something went wrong. Please try again.',

		// Compose message
		to: 'To',
		sendMessage: 'Send Message',
		moveTo: 'Move to',
		messageSent: 'Your message was sent.',

		// MessageActions
		done: 'Done',
		move: 'Move',
		markAs: 'Mark As',
		read: 'Read',
		unread: 'Unread',
		junk: 'Junk',
		notJunk: 'Not Junk',
		blacklist: 'Blacklist',
		whitelist: 'Whitelist',
		distribute: 'Distribute',
		forward: 'Forward',
		'delete': 'Delete',
		more: 'More',
		reply: 'Reply',
		replyAll: 'Reply All',

		// Message Filters
		allResults: 'All Results',
		from: 'From',
		subject: 'Subject',
		attachments: 'Attachments',
		message: 'Message',
		allMessages: 'All Messages',
		myMessages: 'My Messages',
		newMessages: 'New Messages',
		source: 'Source',
		sortedBy: 'Sorted by',
		date: 'Date',
		byDate: 'By Date',
		sender: 'Sender',
		bySender: 'By Sender',
		filterBarLabel:  '{filter}, sorted by {sort}',

		// Message Notification
		newMessagesCount: '{NUM, plural, one {1 New Message} other {# New Messages}}',

		// Inbox View
		congratulations: 'Congratulations!',
		inboxZero: 'You have achieved Inbox Zero',
		noMessages: 'no messages to display',
		searching: 'Searching... This may take a few minutes.',

		// Message Labels
		draft: 'Draft',

		// Notification list
		markAllAsRead: 'Mark all as read',
		toggleReadStatus: 'Mark as {ISREAD, select, true {unread} other {read}}',
		commentMention: '<strong>{NAME}</strong> mentioned you in a comment:',

		// Message Composition
		sendOptions: 'Send Options',
		priority: 'Priority',
		low: 'Low',
		standard: 'Standard',
		high: 'High',
		draftSaveOnClose: 'Draft Save on Close',

		// Quick Reply
		selectAllCamelCase: 'Select All',
		selectNoneCamelCase: 'Select None',

		// Smart date units
		minuteUnit: 'm',
		hourUnit: 'h',
		dayUnit: 'd',

		// Alerts
		undoQuestion: 'Undo?',

		// Conversations
		viewSource: 'View Source'
	}
};

export = i18n;
