/// <amd-dependency path="dojo/dom-form" />
/// <amd-dependency path="mayhem/templating/html!app/ui/messages/MessageFilters.html" />

import app = require('../app');
import bindings = require('mayhem/binding/interfaces');
import Connection = require('app/models/Connection');
import ConnectionStore = require('app/models/stores/Connection'); ConnectionStore;
import Message = require('app/models/Message');
import MessageFilters = require('app/ui/messages/MessageFilters');
import MessageStore = require('app/models/stores/Message');
import on = require('dojo/on');
import User = require('app/auth/User');
import ViewModel = require('app/viewModels/MessageFilters');

// comment out this line to disable service mocks
import mocks = require('../../mocks/all'); mocks;

// There are no .d.ts declarations for these modules yet
var domForm:any = require('dojo/dom-form');

Connection.setDefaultApp(app);
(<any> Connection.store).app = app;
Message.setDefaultApp(app);
Message.setDefaultStore(new MessageStore({ app: app }));

app.run().then(function () {
	on(document.querySelector('.LoginForm'), 'submit', function (event) {
		event.preventDefault();
		var value = domForm.toObject(this);
		var user:User = <any> app.get('user');

		user.login({
			username: value.username,
			password: value.password
		}).then(function () {
			var model = new ViewModel({
				app: app,
				messages: Message.store,
				connections: Connection.store
			});

			var messageFilters = new MessageFilters({
				app: app,
				model: model
			});
			app.get('ui').set('view', messageFilters);

			app.get('binder').createBinding<string>(model, 'selectedFilter')
				.observe(function (change:bindings.IChangeRecord<string>):void {
					console.log('Selected filter set to ' + change.value);
				});

			app.get('binder').createBinding<string>(model, 'selectedSort')
				.observe(function (change:bindings.IChangeRecord<string>):void {
					console.log('Selected sort set to ' + change.value);
				});

			app.get('binder').createBinding(model, 'selectedConnections')
				.observe(function (change:bindings.IChangeRecord<Connection[]>):void {
					if (change.value) {
						var names = change.value.map(function (connection:any):string {
							return connection.get('type') + ': ' + connection.get('displayName');
						});

						console.log('Connection filters set to: ' + names.join('; '));
					}
				});
		});
	});
});

export = app;
