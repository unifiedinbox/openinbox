import Alert = require('../models/Alert');
import Contact = require('../models/Contact');
import ContactStore = require('../models/stores/Contact'); ContactStore;
import Conversation = require('../models/Conversation');
import ConversationStore = require('../models/stores/Conversation'); ConversationStore;
import Comment = require('../models/Comment');
import Folder = require('../models/Folder');
import Message = require('../models/Message');
import MessageActionsViewModel = require('../viewModels/MessageActions');
import MessageFiltersViewModel = require('../viewModels/MessageFilters');
import MessageStore = require('../models/stores/Message');
import Notification = require('../models/Notification');
import Promise = require('mayhem/Promise');
import Observable = require('mayhem/Observable');
import WebApplication = require('mayhem/WebApplication');

import View = require('../views/Inbox');
import ViewModel = require('../viewModels/Inbox');
import User = require('../auth/User');

class Route extends Observable {
	get:Route.Getters;
	set:Route.Setters;

	protected _model:ViewModel;
	protected _view:any;

	destroy() {
		super.destroy();
		this._view && this._view.destroy();
	}

	enter(kwArgs:Route.KwArgs) {
		// TODO: Eventually, user folders should be populated elsewhere.
		// Populating here for now to test folder sidebar.

		var app = <any> this.get('app');
		var user = <User> app.get('user');

		if (!user.get('isAuthenticated')) {
			return app.get('router').go('login', { action: 'login' });
		}

		user.set('alerts', Alert.store);

		// TODO: additional information should also come from a real source
		user.set('backgroundImage', require.toUrl('app/resources/images/background.jpg'));

		var unreadCount = 0;
		var message:string = 'Bacon ipsum dolor amet porchetta cow capicola pork belly \
		beef ribs short ribs ribeye shoulder swine tail. Strip steak cupim drumstick, \
		salami rump t-bone biltong jowl pork loin andouille porchetta fatback. Porchetta \
		picanha tenderloin bacon. Picanha sausage spare ribs meatloaf, sirloin pastrami \
		turducken hamburger. Alcatra drumstick short loin turkey andouille spare ribs \
		kevin pastrami sirloin tongue turducken.';

		var promises:IPromise<Notification>[] = [];
		while (unreadCount < 10) {
			promises.push(Contact.get(Math.floor(unreadCount / 2))
				.then(function (contact:Contact):IPromise<Notification> {
					return !contact ? null: Notification.store.put(new Notification({
						id: unreadCount,
						type: 'mention',
						item: new Comment({
							contact: contact,
							message: message
						})
					}));
				}));

			unreadCount += 1;
		}

		var self = this;
		Promise.all(promises).then(function () {
			user.set('mentions', Notification.store.filter({ type: 'mention' }));
			user.set('conversations', Conversation.store);

			Message.setDefaultStore(new MessageStore({ app: app }));
			self._model = new ViewModel({
				app: app,
				// TODO: Should these be created here or in viewModels/Inbox?
				messageActionsModel: new MessageActionsViewModel({
					app: app,
					excludedFolders: [ 'Drafts', 'Outbox', 'Sent', 'Archive' ],
					hideDistribute: true,
					hideMore: true,
					isOpen: true
				}),
				messageFiltersModel: new MessageFiltersViewModel({
					app: app,
					connections: user.get('connections')
				})
			});

			// TODO: Given that many properties rely on the value of `folder`, it is set
			// after the rest of the properties have already been added.
			Folder.get(kwArgs.folderId).then(function (folder:Folder):void {
				self._model.set({
					folder: folder
				});

				self._view = new View({
					app: app,
					model: self._model
				});

				app.get('ui').set('view', self._view);
			});
		});
	}

	exit() {
		this.get('app').get('ui').get('view').set('default', null);
	}

	update(kwArgs:Route.KwArgs) {
		Folder.get(kwArgs.folderId).then((folder:Folder):void => {
			this.get('model').set('folder', folder);
		});
	}
}

module Route {
	export interface Getters extends Observable.Getters {
		(key:'app'):WebApplication;
		(key:'model'):ViewModel;
	}

	export interface Setters extends Observable.Setters {}

	export interface KwArgs {
		folderId:string;
	}
}

export = Route;
