/// <amd-dependency path="mayhem/templating/html!./NotificationRow.html" />

import Event = require('mayhem/Event');
import ListView = require('mayhem/ui/dom/ListView');
import models = require('mayhem/data/interfaces');
import Notification = require('../../models/Notification');
import NotificationProxy = require('../../viewModels/NotificationList');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');
import WebApplication = require('mayhem/WebApplication');

var NotificationRow = require<any>('mayhem/templating/html!./NotificationRow.html');
NotificationRow.prototype.selectNotification = function (event:ui.ClickEvent):void {
	if (event.target.get('id') !== 'toggleStatus') {
		this.emit(new Event({
			type: 'notification-selected',
			bubbles: true,
			cancelable: false,
			target: this
		}));
	}
};
NotificationRow.prototype.toggleStatus = function (event:ui.ClickEvent):void {
	var model = <any> this.get('model');
	model.set('isRead', !model.get('isRead'));
};

class MarkAllAsReadButton extends SingleNodeWidget {
	_node:HTMLElement;

	_render():void {
		var app:WebApplication = <any> this.get('app');
		var textNode:Text = document.createTextNode((<any> app.get('i18n')).get('messages').markAllAsRead());

		this._node = document.createElement('a');
		this._node.classList.add('NotificationList-markAllAsRead');
		this._node.appendChild(textNode);
	}
}

class NotificationList extends SingleNodeWidget {
	get:NotificationList.Getters;
	set:NotificationList.Setters;

	_node:HTMLElement;

	protected _listView:ListView<Notification>;
	protected _markAllAsReadButton:MarkAllAsReadButton;

	protected _collection:dstore.ICollection<models.IProxyModel<Notification>>;
	_collectionGetter():dstore.ICollection<models.IProxyModel<Notification>> {
		return this._collection;
	}
	_collectionSetter(collection:dstore.ICollection<Notification>):void {
		if (collection) {
			this._collection = <any> NotificationProxy.forCollection(collection.sort('date', true));
			this._listView.set('collection', this._collection);
		}
	}

	_isAttachedSetter(value:boolean) {
		this._listView.set('isAttached', value);
		this._isAttached = value;
	}

	constructor(kwArgs:HashMap<any>) {
		util.deferSetters(this, [ 'collection' ], '_render');
	    super(kwArgs);
	}

	markAllAsRead():IPromise<Notification[]> {
		return this._collection.forEach(function (item:Notification):void {
			item.set('isRead', true);
		});
	}

	_render():void {
		var app = <WebApplication> this.get('app');

		this._node = document.createElement('div');
		this._node.classList.add('NotificationList-container');

		this._renderListView();
		this._markAllAsReadButton = new MarkAllAsReadButton({
			app: app,
			parent: this
		});

		this._node.appendChild(this._markAllAsReadButton.detach());

		this._registerEvents();
	}

	protected _renderListView():void {
		var app = <WebApplication> this.get('app');
		var listViewNode:HTMLElement;

		this._listView = new ListView<Notification>({
			app: app,
			itemConstructor: NotificationRow,
			parent: this
		});

		listViewNode = <HTMLElement> this._listView.detach();
		listViewNode.classList.add('dgrid-autoheight');
		listViewNode.classList.add('NotificationList');
		this._node.appendChild(listViewNode);
	}

	protected _registerEvents():void {
		var self = this;

		this.on('activate', function (event:ui.ClickEvent):void {
			if (event.target === self._markAllAsReadButton) {
				event.preventDefault();
				self.markAllAsRead();
			}
		});
	}
}

module NotificationList {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'collection'):dstore.ICollection<models.IProxyModel<Notification>>;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'collection', value:dstore.ICollection<Notification>):void;
	}
}

export = NotificationList;
