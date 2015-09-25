import app = require('./app');
import Avatar = require('app/ui/Avatar');

app.run().then(function () {
	app.get('ui').set('view', new Avatar({
		app: app,
		image: 'KF'
	}));
});

export = app;
