import Label = require('mayhem/ui/Label');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import AlertModel = require('../models/Alert');
import CommandManager = require('../CommandManager');
import Icon = require('./Icon');

class Alert extends SingleNodeWidget {
	get:Alert.Getters;
	set:Alert.Setters;

	_node:HTMLElement;
	protected _className:string;
	protected _model:AlertModel;
	protected _icon:Icon;
	protected _actionLink:Label;
	protected _undoLink:Label;

	_initialize():void {
		super._initialize();

		this._className = 'Alert';
	}

	_render():void {
		var model:AlertModel = this.get('model');
		var command:CommandManager.ICommand = model.get('command');
		var commitLabel = model.get('commitLabel');
		var actionWrapper:HTMLElement;
		var undoWrapper:HTMLElement;

		this._node = document.createElement('div');
		this._node.className = this.get('className');
		this._node.textContent = model.get('message');

		if (commitLabel) {
			actionWrapper = document.createElement('span');
			actionWrapper.classList.add('Alert-action');
			this._actionLink = new Label({
				text: commitLabel,
				app: this.get('app'),
				parent: this,
				type: Alert.LinkType.Commit
			});

			actionWrapper.appendChild(this._actionLink.detach());
			this._node.appendChild(document.createTextNode(' '));
			this._node.appendChild(actionWrapper);
		}

		if (command && command.rollback) {
			undoWrapper = document.createElement('span');
			undoWrapper.classList.add('Alert-undo');

			this._undoLink = new Label({
				text: model.get('undoLabel') || (<any> this.get('app').get('i18n')).get('messages').undoQuestion(),
				app: this.get('app'),
				parent: this,
				type: Alert.LinkType.Undo
			});

			undoWrapper.appendChild(this._undoLink.detach());
			this._node.appendChild(document.createTextNode(' '));
			this._node.appendChild(undoWrapper);
		}

		this._icon = new Icon({
			value: 'app-cancel',
			className: 'Alert-close',
			app: this.get('app'),
			parent: this
		});
		this._node.appendChild(this._icon.detach());
	}

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean) {
		this._icon.set('isAttached', value);
		this._undoLink && this._undoLink.set('isAttached', value);
		this._isAttached = value;
	}
}

module Alert {
	export enum LinkType { Commit, Undo }

	export interface KwArgs {
		message:string;
		command?:CommandManager.ICommand;
		commitLabel?:string;
		undoLabel?:string;
		isPermanent?:boolean;
	}

	export interface Getters extends SingleNodeWidget.Getters {
		(key:'className'):string;
		(key:'model'):AlertModel;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'className', className:string):void;
		(key:'model', model:AlertModel):void;
	}
}

export = Alert;
