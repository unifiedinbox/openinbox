import BaseDropDown = require('mayhem/ui/dom/DropDown');
import Event = require('mayhem/Event');
import lang = require('dojo/_base/lang');
import ui = require('mayhem/ui/interfaces');
import util = require('mayhem/util');

import appUtil = require('../util');

/**
 * Mayhem's DropDown widget places the dropdown underneath the same node as the label, which can be
 * problematic when the widget is placed underneath a node with its `overflow` style set to anything
 * but `visible`. The widget below mitigates this problem by detaching the DropDown from the node,
 * moving it directly underneath the <body> element, and then repositioning it on the fly.
 */
class DropDown extends BaseDropDown {
	get:DropDown.Getters;
	set:DropDown.Setters;

	protected _anchorNode:HTMLElement;

	/**
	 * This is a new property not inherited from BaseDropDown. If specified, the drop down will be
	 * positioned at the lower left corner of the element with this ID when opened.
	 *
	 * TODO: Keeping the ID separate from the node allows the node to be retrieved from the DOM only
	 * when the drop down is opened, and it bypasses problems with calling `document.getElementById`
	 * before the node is available. But is there a cleaner way to manage this? Using `util.deferSetters`
	 * to wait until everything has been rendered should work, but even still the result of
	 * `document.getElementById` is always `null`.
	 */
	protected _anchorNodeId:string;
	_anchorNodeIdGetter():string {
		return this._anchorNodeId;
	}
	_anchorNodeIdSetter(value:string) {
		this._anchorNodeId = value;
		this._anchorNode = null;
	}

	/**
	 * This is a new property not inherited from BaseDropDown. Since the DropDownContainer node
	 * will no longer be placed under `this._node`, it cannot inherit styles from it or its
	 * ancestors. As a result, we need a way to compensate for this loss.
	 */
	protected _dropDownClassName:string;
	_dropDownClassNameGetter():string {
		return this._dropDownClassName;
	}
	_dropDownClassNameSetter(value:string) {
		if (value) {
			this._dropDownNode.className = 'DropDownContainer ' + value;
		}
	}

	protected _dropDownNode:HTMLDivElement;

	_isAttachedSetter(value:boolean) {
		super._isAttachedSetter(value);
		if (!value && this._isOpen) {
			this.set('isOpen', false);
		}
	}

	_isOpenSetter(value:boolean) {
		super._isOpenSetter(value);
		// The second value needs to be coerced into a boolean to prevent `undefined` from
		// being interpreted as "not provided". Any falsy value should hide the drop down.
		this._dropDownNode.classList.toggle('open', Boolean(value));
	}

	protected _isOpenHandle:IHandle;
	protected _labelNode:HTMLDivElement;

	constructor(kwArgs?:HashMap<any>) {
	    util.deferSetters(this, [ 'dropDownClassName' ], '_render');
	    super(kwArgs);
	}

	destroy():void {
		super.destroy();
		this._isOpenHandle && this._isOpenHandle.remove();
	}

	_render():void {
		super._render();
		document.body.appendChild(this._dropDownNode);

		this.on('pointerenter', lang.hitch(this, '_emit', 'dropDownPointerEnter'));
		this.on('pointerleave', lang.hitch(this, '_emit', 'dropDownPointerLeave'));

		this._isOpenHandle = this.get('app').get('binder').createBinding(this, 'isOpen')
			.observe((change):void => {
				this._emit('dropDownOpen');
			});
	}

	protected _emit(type:string, event?:ui.PointerEvent):void {
		this.emit(new Event({
			type: type,
			bubbles: true,
			cancelable: false,
			target: this,
			relatedTarget: event && event.relatedTarget || null
		}));
	}

	protected _getAnchorNode():HTMLElement {
		var anchorNode = this._anchorNode || this._anchorNodeId && document.getElementById(this._anchorNodeId);

		return anchorNode || this._labelNode;
	}

	protected _toggle(event:ui.UiEvent):void {
		// BaseDropDown#_toggle changes the value of isOpen, so it's probably wise
		// to store a reference to its current value before it gets changed.
		var wasOpen:boolean = <any> this.get('isOpen');

		super._toggle(event);

		if (!wasOpen) {
			appUtil.positionNode(this._dropDownNode, this._getAnchorNode());
		}
	}
}

module DropDown {
	export interface Getters extends BaseDropDown.Getters {
		(key:'anchorNodeId'):string;
		(key:'dropDownClassName'):string;
	}

	export interface Setters extends BaseDropDown.Setters {
		(key:'anchorNodeId', value:string):void;
		(key:'dropDownClassName', value:string):void;
	}
}

export = DropDown;
