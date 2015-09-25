import Event = require('mayhem/Event');
import Label = require('mayhem/ui/dom/Label');
import ListView = require('mayhem/ui/ListView');
import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');

import Avatar = require('../Avatar');
import Connection = require('../../models/Connection');
import ConnectionRow = require('./ConnectionRow');

class ForwardingConnectionRow extends ConnectionRow {
	_initialize() {
		super._initialize();
		this._forwardConnectionType = true;
	}
}

/**
 * This widget is somewhat akin to ContactList but with the following differences:
 * * No SelectionManager
 * * No value (emits an event instead when an item is clicked)
 * * No search / showSearch; does not extend SearchWidget, as no search functionality is required
 * * Includes a title property for a label displayed above the list
 * * TODO: Will include an image property for an avatar to display before the title
 */
class ConnectionList extends SingleNodeWidget {
	get:ConnectionList.Getters;
	set:ConnectionList.Setters;

	_node:HTMLDivElement;

	protected _listView:ListView<Connection>;
	protected _titleNode:HTMLDivElement;
	protected _titleAvatar:Avatar;
	protected _titleLabel:Label;

	_isAttachedGetter():boolean {
		return this._isAttached;
	}
	_isAttachedSetter(isAttached:boolean) {
		this._listView.set('isAttached', isAttached);
		this._titleLabel.set('isAttached', isAttached);
		this._titleAvatar && this._titleAvatar.set('isAttached', isAttached);
		this._isAttached = isAttached;
	}

	protected _collection:dstore.ICollection<Connection>;

	_collectionGetter():dstore.ICollection<Connection> {
		return this._collection;
	}
	_collectionSetter(collection:dstore.ICollection<Connection>):void {
		this._collection = collection;
		this._listView.set('collection', collection);
	}

	protected _image:string;

	_imageGetter():string {
		return this._image;
	}
	_imageSetter(image:string) {
		if (this._titleAvatar) {
			this._titleAvatar.detach();
			this._titleAvatar.destroy();
		}
		if (image) {
			var avatar = this._titleAvatar = new Avatar({
				image: image
			});
			this._titleNode.insertBefore(avatar.detach(), this._titleLabel.get('firstNode'));
		}
	}

	protected _title:string;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'collection', 'image' ], '_render');
		super(kwArgs);
	}

	_initialize() {
		super._initialize();
		this._image = this._title = '';
	}

	destroy() {
		super.destroy();
		this._listView.destroy();
		this._titleLabel.destroy();
		this._titleAvatar && this._titleAvatar.destroy();
	}

	_onRowActivate(event:ui.PointerEvent) {
		var target = event.target;
		if (!(target instanceof ConnectionRow)) {
			target = target.get('parent');
		}
		if (target instanceof ConnectionRow) {
			this.emit(new Event({
				type: 'connectionSelected',
				bubbles: true,
				cancelable: false,
				target: target
			}));
		}
	}

	_render():void {
		var node = this._node = document.createElement('div');
		node.className = 'ContactList ConnectionList';

		var titleNode = this._titleNode = document.createElement('div');
		titleNode.className = 'ConnectionList-title';
		node.appendChild(titleNode);

		this._titleLabel = new Label({});
		titleNode.appendChild(this._titleLabel.detach());

		this._listView = new ListView<Connection>({
			app: this.get('app'),
			parent: this,
			itemConstructor: ForwardingConnectionRow
		});
		var listViewNode = <HTMLDivElement> this._listView.detach();
		listViewNode.classList.add('dgrid-autoheight');
		listViewNode.classList.add('ContactList-grid');
		node.appendChild(listViewNode);

		this.get('app').get('binder').bind({
			source: this,
			sourcePath: 'title',
			target: this._titleLabel,
			targetPath: 'text'
		});

		this.on('activate', this._onRowActivate.bind(this));
	}
}

module ConnectionList {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'firstNode'):HTMLDivElement;
		(key:'lastNode'):HTMLDivElement;
		(key:'collection'):dstore.ICollection<Connection>;
		(key:'listView'):ListView<Connection>; // Exposed for testing
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'collection', collection:dstore.ICollection<Connection>):void;
	}
}

export = ConnectionList;
