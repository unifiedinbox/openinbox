/// <amd-dependency path="mayhem/templating/html!app/views/Loading.html" />

import LoadingViewModel = require('../viewModels/Loading');
import Observable = require('mayhem/Observable');
import User = require('../auth/User');
import WebApplication = require('mayhem/WebApplication');

var Loading = require <any> ('mayhem/templating/html!../views/Loading.html');

class Route extends Observable {
	get:Route.Getters;
	set:Route.Setters;

	protected _viewModel:LoadingViewModel;
	protected _view:any;

	destroy() {
		super.destroy();
		this._view && this._view.destroy();
		this._viewModel && this._viewModel.destroy();
	}

	enter():IPromise<void> {
		return this.update();
	}

	update():IPromise<void> {
		var app = <any> this.get('app');
		var user = <User> app.get('user');
		var loading = this._view;

		if (!user.get('isAuthenticated')) {
			return app.get('router').go('login', { action: 'login' });
		}

		if (!loading) {
			var quote = user.get('session').get('quote');
			var viewModel = this._viewModel = new LoadingViewModel({
				author: quote.author,
				message: quote.quotes
			});
			loading = this._view = new Loading({
				app: app,
				model: viewModel
			});
		}

		app.get('ui').set('view', loading);

		user.preloadData().then(function () {
			// TODO: Parameterize route to forward to
			// TODO: where should we get Inbox folderId from?
			app.get('router').go('inbox', { folderId: 5 });
		});
	}
}

module Route {
	export interface Getters extends Observable.Getters {
		(key:'app'):WebApplication;
	}

	export interface Setters extends Observable.Setters {}
}

export = Route;
