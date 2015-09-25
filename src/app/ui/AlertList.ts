import Label = require('mayhem/ui/Label');
import ListView = require('mayhem/ui/ListView');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import util = require('mayhem/util');
import Alert = require('./Alert');
import AlertModel = require('../models/Alert');
import CommandManager = require('../CommandManager');
import Icon = require('./Icon');

var DEFAULT_ALERT_LIMIT = 5;
var DEFAULT_ALERT_TIMEOUT = 5000;

class AlertList extends SingleNodeWidget {
	get:AlertList.Getters;
	set:AlertList.Setters;

	_node:HTMLElement;
	protected _listView:ListView<Alert>;
	protected _commandManager:CommandManager;
	protected _handlesByAlertId:HashMap<IHandle>;
	protected _queuedAlerts:Alert.KwArgs[];

	protected _className:string;
	protected _duration:number;
	protected _maximumLength:number;

	protected _collection:dstore.ICollection<AlertModel>;

	_collectionGetter():dstore.ICollection<AlertModel> {
		return this._collection;
	}
	_collectionSetter(collection:dstore.ICollection<AlertModel>):void {
		this._collection = collection;
		if (collection) {
			this._listView.set('collection', this._collection);
		}
	}

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(value:boolean) {
		this._listView.set('isAttached', value);
		this._isAttached = value;
	}

	constructor(kwArgs:HashMap<any>) {
		util.deferSetters(this, [ 'collection' ], '_render');

		super(kwArgs);

		// After super(), duration is the value passed in, or the default from _initialize
		this._commandManager = new CommandManager({
			delay: this.get('duration')
		});
	}

	_initialize() {
		super._initialize();

		this._maximumLength = DEFAULT_ALERT_LIMIT;
		this._duration = DEFAULT_ALERT_TIMEOUT;
		this._className = 'AlertList';
		this._queuedAlerts = [];
		this._handlesByAlertId = {};
	}

	_render() {
		var listViewNode:HTMLElement;

		this._node = document.createElement('div');
		this._node.className = this.get('className');

		this._listView = new ListView<AlertModel>({
			app: this.get('app'),
			parent: this,
			itemConstructor: Alert
		});
		listViewNode = <HTMLElement> this._listView.detach();
		listViewNode.classList.add('dgrid-autoheight');
		this._node.appendChild(listViewNode);

		this.on('activate', this._clickHandler.bind(this));
	}

	add(alertArgs:Alert.KwArgs):IPromise<void> {
		var self = this;

		return AlertModel.store.fetch().then(function (results) {
			if (results.length < self.get('maximumLength')) {
				return AlertModel.store.add(new AlertModel({
					app: self.get('app'),
					message: alertArgs.message,
					isPermanent: alertArgs.isPermanent,
					command: alertArgs.command,
					commitLabel: alertArgs.commitLabel,
					undoLabel: alertArgs.undoLabel
				})).then(function (alertModel:AlertModel) {
					var handle:IHandle;

					if (!alertModel.get('isPermanent')) {
						handle = self._commandManager.add({
							command: {
								commit(command:CommandManager.ICommand) {
									AlertModel.store.remove(alertModel.get('id'));

									try {
										if (alertArgs.command && alertArgs.command.commit) {
											alertArgs.command.commit(alertArgs.command);
										}
									}
									finally {
										self._next();
									}
								}
							}
						});

						self._handlesByAlertId[alertModel.get('id')] = handle;
					}
				});
			}
			else {
				self._queuedAlerts.push(alertArgs);
			}
		});
	}

	_next() {
		if (this._queuedAlerts.length) {
			this.add(this._queuedAlerts.shift());
		}
	}

	_clickHandler(event:Event) {
		if (!(event.target instanceof Label || event.target instanceof Icon)) {
			return;
		}

		var alertModel = (<any> event.target).get('parent').get('model');
		var command = alertModel.get('command');
		var alertId = alertModel.get('id');
		var handle = this._handlesByAlertId[alertId];

		// Either a Label or the Close Icon was clicked; both cases cause the alert to be dismissed
		AlertModel.store.remove(alertId);

		handle && handle.remove();
		delete this._handlesByAlertId[alertId];
		this._next();

		if (event.target instanceof Label) {
			if ((<any> event.target).get('type') === Alert.LinkType.Undo) {
				if (command && command.rollback) {
					command.rollback(command);
				}
			}
			else if ((<any> event.target).get('type') === Alert.LinkType.Commit) {
				if (command && command.commit) {
					command.commit(command);
				}
			}
		}
		else {
			// The close icon should commit only if there is not a specifically called-out commit action
			if (!alertModel.get('commitLabel') && command && command.commit) {
				command.commit(command);
			}
		}
	}
}

module AlertList {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'className'):string;
		(key:'duration'):number;
		(key:'maximumLength'):number;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'className', className:string):void;
		(key:'duration', duration:number):void;
		(key:'maximumLength', maximumLength:number):void;
	}
}

export = AlertList;
