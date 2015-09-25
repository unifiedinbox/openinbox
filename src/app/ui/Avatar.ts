/// <reference path="../interfaces.d.ts" />

import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import util = require('mayhem/util');
import domConstruct = require('dojo/dom-construct');
import eTypeAdapter = require('../models/adapters/eType');

// TODO: Move this to a util module if it needs reuse
function escapeCssUrl(url:string) {
	return url.replace(/([\"\\])/g, '\\$1');
}

class Avatar extends SingleNodeWidget {
	get:Avatar.Getters;
	set:Avatar.Setters;

	// TODO: _node should probably be protected, eventually, but is currently public in Mayhem
	_node:HTMLElement;
	protected _initialsNode:Text;

	/** URL of an image to display, or two initials to display in its place */
	protected _image:string;

	/** Type of connection that the avatar represents */
	protected _connectionType:string;

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'image', 'connectionType' ], '_render');
		super(kwArgs);
	}

	_initialize():void {
		super._initialize();
		// Purposely run setter logic even for default image and connectionType to set up DOM
		this.set('image', '');
		this.set('connectionType', '');
	}

	_imageGetter():string {
		return this._image;
	}

	_imageSetter(image:string):void {
		// image will either be a full image URL, or a 2-character string of initials to display instead
		// (Two separate properties might be cleaner, but this is how their API works)
		var hasImage = image && image.length > 2;

		// Reset contents and class from any previous state
		domConstruct.empty(this._node);
		// TODO: Preferably use this.get('classList') once it is hooked up by Mayhem
		this._node.classList.toggle('Avatar-no-image', !hasImage);
		this._node.classList.toggle('Avatar-default', !image);

		if (hasImage) {
			this._node.style.backgroundImage = 'url("' + escapeCssUrl(image) + '")';
		}
		else {
			// Remove styles from any previous image case
			this._node.style.backgroundImage = '';

			// Populate with initials, or with a default icon from the app icon font
			this._initialsNode = document.createTextNode(image || 'k');
			this._node.appendChild(this._initialsNode);
		}

		this._image = image;
	}

	_connectionTypeGetter():string {
		return this._connectionType;
	}

	_connectionTypeSetter(connectionType:string):void {
		// TODO: Preferably use this.get('classList') once it is hooked up by Mayhem
		this._node.classList.remove(
			'connection-' + (eTypeAdapter.toConnectionType(this._connectionType) || 'none'));
		this._node.classList.add(
			'connection-' + (eTypeAdapter.toConnectionType(connectionType) || 'none'));
		this._connectionType = connectionType;
	}

	_render():void {
		this._node = document.createElement('div');
		// TODO: possibly move this to initialize once Mayhem has better class/classList support
		this._node.className = 'Avatar';
	}
}

module Avatar {
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'image'):string;
		(key:'connectionType'):string;
		// Override first/lastNode getters to match _node
		(key:'firstNode'):HTMLElement;
		(key:'lastNode'):HTMLElement;
	}

	export interface Setters extends SingleNodeWidget.Setters {
		(key:'image', value:string):void;
		(key:'connectionType', value:string):void
	}
}

export = Avatar;
