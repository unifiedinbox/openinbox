/* tslint:disable:no-unused-variable */
var dojoConfig = {
	async: true,
	baseUrl: '../../../',
	packages: [
		{ name: 'app', location: 'app' },
		{ name: 'dgrid', location: 'dgrid' },
		{ name: 'dijit', location: 'dijit' },
		{ name: 'dojo', location: 'dojo' },
		{ name: 'dstore', location: 'dstore' },
		{ name: 'esprima', location: 'esprima', main: 'esprima' },
		{ name: 'intl', location: 'intl', main: 'Intl.complete' },
		{ name: 'intl-messageformat', location: 'intl-messageformat/dist', main: 'intl-messageformat-with-locales' },
		{ name: 'mayhem', location: 'mayhem' },
		{ name: 'messageformat', location: 'messageformat', main: 'messageformat' },
		{ name: 'put-selector', location: 'put-selector' },
		{ name: 'xstyle', location: 'xstyle' },
		{ name: 'strophe', location: 'strophe' }
	],
	requestProvider: 'dojo/request/registry'
};
