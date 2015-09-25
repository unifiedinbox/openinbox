import declare = require('dojo/_base/declare');

interface HeaderMixin {
	_getAppHeaders:() => HeaderMixin.IAppHeaders;
}

/**
 * HeaderMixin provides two common pieces of functionality needed for application stores:
 * 1. It can resolve this.app from a module ID (akin to what mayhem's Model does)
 * 2. It exposes a _getAppHeaders method for generating the necessary authorization headers
 */
var HeaderMixin = declare(null, {
	_getAppHeaders: function () {
		if (typeof this.app === 'string') {
			this.app = require(this.app);
		}

		var user = this.app.get('user');
		return {
			apikey: this.app.get('apikey'),
			sessionId: user.get('sessionId'),
			app: user.get('uibApplication')
		};
	}
});

module HeaderMixin {
	export interface IAppHeaders {
		apikey:string;
		sessionId:string;
		app:string;
	}
}

export = HeaderMixin;
