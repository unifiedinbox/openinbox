import lang = require('dojo/_base/lang');
import Observable = require('mayhem/Observable');
import RequestError = require('dojo/errors/RequestError');
import WebApplication = require('mayhem/WebApplication');
import ui = require('mayhem/ui/interfaces');
import User = require('../auth/User');

class LoginViewModel extends Observable {
    get:LoginViewModel.Getters;
    set:LoginViewModel.Setters;

    protected _errorClass:string;
    protected _errorMessage:string;
    protected _password:string;
    protected _stayLoggedIn:boolean;
    protected _username:string;

    _initialize():void {
        super._initialize();
        this._errorMessage = '';
        this._stayLoggedIn = false;
    }

    submit(event:ui.KeyboardEvent):IPromise<Object> {
        return (event.code === 'Enter') ? this.login() : null;
    }

    login():IPromise<Object> {
        var app = <any> this.get('app');
        var user = <User> app.get('user');

        return user.login({
            username: this._username,
            password: this._password
        }).then(this._loginSuccess.bind(this), this._loginFailure.bind(this));
    }

    protected _loginFailure(error:RequestError):void {
        var app = <any> this.get('app');
        var messages = (<any> app.get('i18n')).get('messages');
        var status = lang.getObject('response.0.errors.message.details.status', false, error.response.data);

        this.set('errorMessage', status === 401 ? messages.loginFail() : messages.loginError());
        this.set('errorClass', 'error');
    }

    protected _loginSuccess(successResponse:User.ILoginResponse):void {
        var router = (<any> this.get('app')).get('router');
        router && router.go('loading');
    }

    toggleStayLoggedIn():void {
        this.set('stayLoggedIn', !this._stayLoggedIn);
    }

    reset():void {
        this.set('errorClass', '');
        this.set('errorMessage', '');
        this.set('stayLoggedIn', false);
        this.set('username', '');
        this.set('password', '');
    }
}

module LoginViewModel {
    export interface Getters extends Observable.Getters {
        (key:'app'):WebApplication;
        (key:'errorClass'):string;
        (key:'errorMessage'):string;
        (key:'password'):string;
        (key:'stayLoggedIn'):boolean;
        (key:'username'):string;
    };

    export interface Setters extends Observable.Setters {
        (key:'errorClass', errorClass:string):void;
        (key:'errorMessage', errorMessage:string):void;
        (key:'password', password:string):void;
        (key:'stayLoggedIn', stayLoggedIn:boolean):void;
        (key:'username', username:string):void;
    };
}

export = LoginViewModel;
