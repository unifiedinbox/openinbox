import Model = require('mayhem/data/Model');

class User extends Model {
	get:User.Getters;
	set:User.Setters;

	protected _email:string;
	protected _fullName:string;
	protected _id:string;
	protected _image:string;
	protected _username:string;
}

module User {
	export interface Getters extends Model.Getters {
		(key:'email'):string;
		(key:'fullName'):string;
		(key:'id'):string;
		(key:'image'):string;
		(key:'username'):string;
	};

	export interface Setters extends Model.Setters {
		(key:'email', value:string):void;
		(key:'fullName', value:string):void;
		(key:'id', value:string):void;
		(key:'image', value:string):void;
		(key:'username', value:string):void;
	};
}

export = User;
