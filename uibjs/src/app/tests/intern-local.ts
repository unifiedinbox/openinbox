import has = require('intern/dojo/has');
import intern = require('intern');

(function () { return this; })().dojoConfig = {
	// Since we are loading the Dojo 1 AMD loader to emulate the normal environment of our modules more closely,
	// we need to disable actions within the loader that will cause requests to occur before the loader is reconfigured;
	// if `async` is not set, the loader will immediately try to synchronously load all of `dojo/main`
	async: true,
	// has-configuration gets shared between Intern and Dojo 1, which currently causes some problems in Intern code
	// if the `config-deferredInstrumentation` has rule is true (it is by default), so force it off
	deferredInstrumentation: false,
	requestProvider: 'app/tests/mocks/all'
};

var config:intern.Config = {
	proxyPort: 9000,
	proxyUrl: 'http://localhost:9000/',

	tunnel: 'NullTunnel',

	maxConcurrency: 1,

	environments: [
		{ browserName: 'chrome' }
	],

	excludeInstrumentation: /^node_modules|^src\/(?:mayhem|app\/tests)/,

	loader: {
		packages: [
			{ name: 'app', location: 'src/app' },
			{ name: 'dgrid', location: 'src/dgrid' },
			{ name: 'dijit', location: 'src/dijit' },
			{ name: 'dojo', location: 'src/dojo' },
			{ name: 'dstore', location: 'src/dstore' },
			{ name: 'esprima', location: 'src/esprima', main: 'esprima' },
			{ name: 'intl', location: 'src/intl', main: 'Intl.complete' },
			{ name: 'intl-messageformat', location: 'src/intl-messageformat/dist', main: 'intl-messageformat-with-locales' },
			{ name: 'mayhem', location: 'src/mayhem' },
			{ name: 'messageformat', location: 'src/messageformat', main: 'messageformat' },
			{ name: 'put-selector', location: 'src/put-selector' },
			{ name: 'xstyle', location: 'src/xstyle' },
			{ name: 'strophe', location: 'src/strophe' }
		]
	},

	useLoader: {
		'host-browser': '../../src/dojo/dojo.js'
	},

	reporters: has('host-node') ? [ 'pretty', 'lcovhtml' ] : [ 'console', 'html' ],

	suites: [
		'app/tests/unit/all'
	],

	functionalSuites: [
		'app/tests/functional/all'
	]
};

export = config;
