/// <amd-dependency path="mayhem/templating/html!app/views/Login.html" />

import app = require('../ui/app');
import LoginServiceMock = require('../mocks/Login'); LoginServiceMock;
import WebApplication = require('mayhem/WebApplication');

var Login = require <any> ('mayhem/templating/html!app/views/Login.html');

app.run().then(function () {
	var login = new Login({
		app: app
	});
	app.get('ui').set('view', login);
});

export = app;
