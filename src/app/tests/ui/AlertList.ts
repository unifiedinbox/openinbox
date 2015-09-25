import app = require('./app');
import AlertList = require('app/ui/AlertList');
import AlertModel = require('app/models/Alert');

app.run().then(function () {
	app.get('ui').set('view', new AlertList({
		maximumLength: 3,
		app: app,
		collection: AlertModel.store
	}));
});

export = app;
