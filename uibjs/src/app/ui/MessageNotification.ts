import domClass = require('dojo/dom-class');
import WebApplication = require('mayhem/WebApplication');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import ui = require('mayhem/ui/interfaces');
import bindings = require('mayhem/binding/interfaces');

import eTypeAdapter = require('../models/adapters/eType');
import Message = require('../models/Message');
import Notification = require('../models/Notification');
import NotificationObserver = require('../auth/NotificationObserver');
import util = require('mayhem/util');

interface ITypeCounts {
	[key:string]:number;
}

class MessageNotification extends SingleNodeWidget {
	get:MessageNotification.Getters;
	set:MessageNotification.Setters;

	_node:HTMLElement;

	protected _bindingHandles:IHandle[];

	protected _notifications:NotificationObserver;
	_notificationsGetter():NotificationObserver {
		return this._notifications;
	}
	_notificationsSetter(value:NotificationObserver):void {
		this._notifications = value;

		if (value) {
			this.set('state', (this.get('total') > 0) ? 'displayed' : 'hidden');
			this._renderCounts();
			// TODO: Since bindings are only added to `this._notifications`, should the
			// existing handles be destroyed each time a new value is set?
			this._registerBindings();
		}
	}

	/**
	 * "displayed" or "hidden"
	 */
	protected _state:string;
	_stateGetter():string {
		return this._state;
	}
	_stateSetter(state:string):void {
		this._state = state;
		domClass.toggle(this._node, 'is-hidden', state === 'hidden');
	}

	protected _totalCountNode:Text;
	protected _typeCountNodes:HashMap<Text>;

	_totalGetter():number {
		return this._notifications ? this._notifications.get('queue').length : 0;
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'notifications', 'state' ], '_render');
	    super(kwArgs);
	}

	destroy() {
		super.destroy();
		this._notifications = null;
		this._typeCountNodes = null;
		this._totalCountNode = null;
		this._bindingHandles.forEach(function (handle:IHandle):void {
			handle.remove();
		});
	}

	getTotalText():string {
		var messages = (<any> this.get('app')).get('i18n').get('messages');
		return messages.newMessagesCount({ NUM: this.get('total') });
	}

	_initialize():void {
		super._initialize();
		this._bindingHandles = [];
		this._typeCountNodes = {};

		this.set({
			state: 'hidden'
		});
	}

	_render():void {
		this._node = document.createElement('div');
		domClass.add(this._node, 'MessageNotification');
		this._registerEvents();
	}

	protected _getTypeCounts():ITypeCounts {
		var notifications:Notification[] = this._notifications.get('queue');
		return notifications.reduce(function (counts:ITypeCounts, notification:Notification):ITypeCounts {
			var message:Message = <any> notification.get('item');
			var connectionType:string = eTypeAdapter.toConnectionType(message.get('connectionType'));

			if (!counts[connectionType]) {
				counts[connectionType] = 0;
			}

			counts[connectionType] += 1;

			return counts;
		}, <ITypeCounts> {});
	}

	protected _renderCounts():void {
		var counts = this._getTypeCounts();
		var totalNode = document.createElement('span');

		totalNode.className = 'MessageNotification-total';
		this._totalCountNode = document.createTextNode(this.getTotalText());
		totalNode.appendChild(this._totalCountNode);
		this._node.appendChild(totalNode);

		eTypeAdapter.forEachConnectionType((type) => {
			this._renderTypeCount(type, (<any> counts)[type] || 0);
		});
	}

	protected _renderTypeCount(type:string, count:number):Text {
		var countNode = document.createElement('span');
		var textNode = this._typeCountNodes[type] = document.createTextNode(String(count));

		domClass.add(countNode, 'MessageNotification-connection');
		domClass.add(countNode, 'connection-' + type);

		if (count === 0) {
			domClass.add(countNode, 'is-hidden');
		}

		countNode.appendChild(textNode);
		this._node.appendChild(countNode);

		return textNode;
	}

	protected _registerBindings():void {
		var binder = (<WebApplication> this.get('app')).get('binder');
		var binding = binder.createBinding<Notification[]>(this._notifications, 'queue');
		var self = this;

		this._bindingHandles.push(binding.observe(function (change:bindings.IChangeRecord<Notification[]>) {
			var total = self.get('total');
			var counts = self._getTypeCounts();

			self._totalCountNode.nodeValue = self.getTotalText();
			self.set('state', total > 0 ? 'displayed' : 'hidden');

			eTypeAdapter.forEachConnectionType(function (type) {
				var typeCount:number = counts[type] || 0;
				var typeNode:Text = self._typeCountNodes[type];
				typeNode.nodeValue = String(typeCount);

				domClass.toggle(<HTMLElement> typeNode.parentNode, 'is-hidden', typeCount < 1);
			});
		}));
	}

	protected _registerEvents():void {
		this.on('activate', (event:ui.ClickEvent):void => {
			var totalNode:HTMLElement = <any> this._totalCountNode.parentNode;
			totalNode.classList.add('is-pending');
			this._notifications.commit().then(function () {
				totalNode.classList.remove('is-pending');
			});
		});
	}
}

module MessageNotification {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'notifications'):NotificationObserver;
		(key:'state'):string;
		(key:'total'):number;
		// Override first/lastNode getters to match _node
		(key:'firstNode'):HTMLElement;
		(key:'lastNode'):HTMLElement;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'notifications', value:NotificationObserver):void;
		(key:'state', value:string):void;
	}
}

export = MessageNotification;
