// This module returns an app with no router or default view, for standalone manual tests

import WebApplication = require('mayhem/WebApplication');

// stores are loaded to ensure that if they set their associated model's 'store' property, it runs *now*, before the logic
// later in this module that sets the store's 'app' property
import Attachment = require('app/models/Attachment');
import AttachmentStore = require('app/models/stores/Attachment'); AttachmentStore;
import Connection = require('app/models/Connection');
import ConnectionStore = require('app/models/stores/Connection'); ConnectionStore;
import Contact = require('app/models/Contact');
import ContactStore = require('app/models/stores/Contact'); ContactStore;
import Conversation = require('app/models/Conversation');
import ConversationStore = require('app/models/stores/Conversation'); ConversationStore;
import Folder = require('app/models/Folder');
import FolderStore = require('app/models/stores/Folder'); FolderStore;
import Message = require('app/models/Message');
import MessageStore = require('app/models/stores/Message'); MessageStore;

var app:WebApplication = new WebApplication({
	name: 'Test',
	apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT',
	components: {
		i18n: { preload: [ 'app/nls/main' ] },
		router: null,
		ui: {
			view: null
		},
		user: {
			constructor: 'app/auth/User'
		}
	}
});

Attachment.setDefaultApp(app);
(<any> Attachment.store).app = app;
Connection.setDefaultApp(app);
(<any> Connection.store).app = app;
Contact.setDefaultApp(app);
(<any> Contact.store).app = app;
Conversation.setDefaultApp(app);
(<any> Conversation.store).app = app;
Folder.setDefaultApp(app);
(<any> Folder.store).app = app;
Message.setDefaultApp(app);
(<any> Message.store).app = app;

export = app;
