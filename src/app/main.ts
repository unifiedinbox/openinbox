// Remove this to test against real services
import mocks = require('./tests/mocks/all'); mocks;

import WebApplication = require('mayhem/WebApplication');

var app:WebApplication = new WebApplication({
	name: 'Unified Inbox',
	apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT',
	components: {
		i18n: { preload: [ 'app/nls/main' ] },
		router: {
			defaultRoute: { routeId: 'login', kwArgs: { action: 'login' } },
			rules: [
				{
					routeId: 'inbox',
					path: 'inbox/<folderId:\\d+>'
				},
				{
					routeId: 'loading',
					path: 'loading'
				},
				{
					routeId: 'login',
					path: 'login/<action:login|logout|register|resetpassword>'
				}
			],
			routes: {
				'inbox': 'app/routes/Inbox',
				'loading': 'app/routes/Loading',
				'login': 'app/routes/Login',
			}
		},
		ui: { view: null },
		user: {
			constructor: 'app/auth/User'
		}
	}
});
app.run().otherwise(function (error:Error):void {
	console.log('app error', error);
});

export = app;
