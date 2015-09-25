import BaseUser = require('mayhem/auth/User');
import Promise = require('mayhem/Promise');
import endpoints = require('../endpoints');
import Observable = require('mayhem/Observable');
import lang = require('dojo/_base/lang');
import request = require('dojo/request');
import RequestError = require('dojo/errors/RequestError');
import Session = require('./Session');
import UserModel = require('../models/User');
import Connection = require('../models/Connection');
import ConnectionStore = require('../models/stores/Connection'); ConnectionStore;
import Contact = require('../models/Contact');
import ContactStore = require('../models/stores/Contact'); ContactStore;
import Folder = require('../models/Folder');
import FolderStore = require('../models/stores/Folder'); FolderStore;

class User extends BaseUser {
	get:User.Getters;
	set:User.Setters;

	protected _data:UserModel;
	protected _session:Session;
	protected _sessionId:string;
	protected _uibApplication:string;

	login(kwArgs:Object):IPromise<User.ILoginResponse> {
		return super.login(kwArgs).then((response:User.ILoginResponse) => {
			var data = response.response[0].data;

			if (!data) {
				throw new RequestError('User not logged in', response);
			}

			this.set('id', data.account_id);
			this.set('sessionId', data.session);
			this.set('uibApplication', data.app);
			this.set('data', new UserModel({
				email: data.account_email,
				fullName: data.user_full_name,
				id: data.account_id,
				image: data.account_avatar || data.default_avatar,
				username: data.user_name
			}));

			var session = this._session = new Session({
				userId: this.get('id')
			});
			// Add quote information to session for use by loading view
			session.set('quote', data.quotes);

			return response;
		});
	}

	authenticate(kwArgs:User.IAuthenticateArgs):IPromise<Object> {
		return request.post(endpoints.login, {
			handleAs: 'json',
			headers: {
				apikey: (<any> this.get('app')).get('apikey')
			},
			data: lang.mixin({ service: 'uib' }, kwArgs)
		});
	}

	logout():IPromise<{}> {
		(<ContactStore> Contact.store).evictAll();
		super.logout();
		this.set('sessionId', '');
		this.set('uibApplication', '');

		return request.post(endpoints.logout, {
			headers: {
				apikey: (<any> this.get('app')).get('apikey')
			}
		});
	}

	preloadData():IPromise<any[]> {
		var promises:IPromise<any>[] = [];
		var user = this;

		promises.push(Folder.store.fetch().then(function () {
			user.set('folders', Folder.store);
		}));
		promises.push(Contact.store.fetch().then(function () {
			user.set('contacts', Contact.store);
		}));
		promises.push(Connection.store.fetch().then(function () {
			user.set('connections', Connection.store);
		}));

		return Promise.all(promises);
	}

	register():IPromise<Object> {
		window.location.href = endpoints.register;
		return null;
	}

	resetPassword():IPromise<Object> {
		window.location.href = endpoints.forgotPassword;
		return null;
	}
}

module User {
	export interface IAuthenticateArgs {
		username:string;
		password:string;
	}

	export interface IQuote {
		quotes:string;
		author:string;
	}

	export interface ILoginResponse {
		response: User.ILoginData[];
	}

	export interface ILoginData {
		data:{
			account_id:number;
			account_avatar:string;
			account_email:string;
			default_avatar:string;
			session:string;
			app:string;
			api:string;
			upload:string;
			user_full_name:string;
			user_name:string;
			user_type:string;
			quotes:User.IQuote
		};
	}

	export interface Getters extends Observable.Getters {
		(key:'data'):UserModel;
		(key:'session'):Session;
		(key:'sessionId'):string;
		(key:'uibApplication'):string;
	};

	export interface Setters extends Observable.Setters {
		(key:'data', value:UserModel):void;
		(key:'session', session:Session):void;
		(key:'sessionId', sessionId:string):void;
		(key:'uibApplication', uibApplication:string):void;
	};
}

export = User;
