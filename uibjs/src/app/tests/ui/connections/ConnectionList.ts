import Event = require('mayhem/Event');

import app = require('../app');
import ConnectionList = require('app/ui/connections/ConnectionList');
import Connection = require('app/models/Connection');
import ConnectionStore = require('app/models/stores/Connection'); ConnectionStore;
import User = require('app/auth/User');

import mocks = require('../../mocks/all'); mocks;

app.run().then(function () {
	return (<User> (<any> app).get('user')).login({ username: 'test', password: 'test' });
}).then(function () {
	Connection.setDefaultApp(app);
	(<any> Connection.store).app = app;

	var connectionList = new ConnectionList({
		app: app,
		collection: Connection.store
	});

	app.get('ui').set('view', connectionList);

	connectionList.on('connectionSelected', function (event:Event) {
		console.log('Connection selected:', event.target.get('model'));
	});
});

export = app;
