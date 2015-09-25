/// <amd-dependency path="mayhem/templating/html!app/views/Login.html" />

import LoginViewModel = require('../viewModels/Login');
import Observable = require('mayhem/Observable');
import User = require('../auth/User');
import WebApplication = require('mayhem/WebApplication');

var Login = require <any> ('mayhem/templating/html!app/views/Login.html');

class Route extends Observable {
    get:Route.Getters;
    set:Route.Setters;

    protected _viewModel:LoginViewModel;
    protected _view:any;

    destroy() {
        super.destroy();
        this._view && this._view.destroy();
        this._viewModel && this._viewModel.destroy();
    }

    enter(kwArgs:Route.KwArgs):IPromise<void> {
        return this.update(kwArgs);
    }

    update(kwArgs:Route.KwArgs):IPromise<void> {
        if (!kwArgs.action) {
            return this.get('app').get('router').go('login', { action: 'login' });
        }

        var key = '_' + (kwArgs.action || 'login') + 'ActionHandler';
        if ((<any> this)[key]) {
            return (<any> this)[key](kwArgs);
        }
        return null;
    }

    protected _loginActionHandler(kwArgs:Route.KwArgs):IPromise<void> {
        var app = <any> this.get('app');
        if (app.get('user').get('isAuthenticated')) {
            return app.get('router').go('loading');
        }

        var login = this._view;

        if (!login) {
            this._viewModel = new LoginViewModel({ app: app });
            login = this._view = new Login({
                app: app,
                model: this._viewModel
            });
        }

        this._viewModel.reset();
        app.get('ui').set('view', login);

        return null;
    }

    protected _logoutActionHandler(kwArgs:Route.KwArgs):IPromise<void> {
        var app = <any> this.get('app');
        return (<User> app.get('user')).logout().then(function () {
            app.get('router').go('login', { action: 'login' });
        });
    }

    protected _registerActionHandler(kwArgs:Route.KwArgs):IPromise<void> {
        var app = <any> this.get('app');
        (<User> app.get('user')).register();

        return null;
    }

    protected _resetpasswordActionHandler(kwArgs:Route.KwArgs):IPromise<void> {
        var app = <any> this.get('app');
        (<User> app.get('user')).resetPassword();

        return null;
    }
}

module Route {
    export interface Getters extends Observable.Getters {
        (key:'app'):WebApplication;
    }

    export interface Setters extends Observable.Setters {}

    export interface KwArgs {
        action:string;
    }
}

export = Route;
