import app = require('../app');
import GroupedConnectionList = require('app/ui/connections/GroupedConnectionList');
import Connection = require('app/models/Connection');
import ConnectionStore = require('app/models/stores/Connection'); ConnectionStore;
import User = require('app/auth/User');

import mocks = require('../../mocks/all'); mocks;

app.run().then(function () {
	return (<User> (<any> app).get('user')).login({ username: 'test', password: 'test' });
}).then(function () {
	Connection.setDefaultApp(app);
	(<any> Connection.store).app = app;

	var connectionList = new GroupedConnectionList({
		app: app,
		collection: Connection.store
	});

	app.get('ui').set('view', connectionList);

	app.get('binder').createBinding(connectionList.get('value'), '*').observe(function (change:any) {
		var type = change.added ? 'added' : 'removed';
		var connection = change[type][0];
		console.log('selection ' + type + ':', connection.get('displayName'), connection.get('type'));
	});
});

export = app;
