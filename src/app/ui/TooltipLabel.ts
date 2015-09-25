import SingleNodeWidget = require('mayhem/ui/dom/SingleNodeWidget');
import util = require('mayhem/util');
import ui = require('mayhem/ui/interfaces');

class TooltipLabel extends SingleNodeWidget {
	get:TooltipLabel.Getters;
	set:TooltipLabel.Setters;
	on:TooltipLabel.Events;

	_node:HTMLSpanElement;

	protected _delay:number;

	protected _delayTimeoutHandle:number;

	protected _tooltipNode:HTMLDivElement;

	protected _text:string;

	_textGetter():string {
		return this._text;
	}

	_textSetter(text:string):void {
		this._text = text;
		if (this._node.firstChild) {
			this._node.removeChild(this._node.firstChild);
		}
		this._node.appendChild(document.createTextNode(this._text));
	}

	_initialize():void {
		super._initialize();
		this._delay = 1000;
	}

	constructor(kwArgs?:HashMap<any>) {
		util.deferSetters(this, [ 'text' ], '_render');
		super(kwArgs);
	}

	_enterHandler(event:ui.PointerEvent):void {
		var self:TooltipLabel = this;
		var node = this._node;
		if (!this._tooltipNode && node.scrollWidth > node.clientWidth) {
			if (this._delayTimeoutHandle !== undefined) {
				clearTimeout(this._delayTimeoutHandle);
			}
			this._delayTimeoutHandle = setTimeout(function () {
				self._delayTimeoutHandle = undefined;
				self._tooltipNode = self._renderTooltip();

				var boundingRect = node.getBoundingClientRect();
				self._tooltipNode.style.left = boundingRect.left + 'px';
				self._tooltipNode.style.top = (boundingRect.top - node.clientHeight) + 'px';

				document.body.appendChild(self._tooltipNode);
			}, this._delay);
		}
	}

	_exitHandler():void {
		if (this._delayTimeoutHandle !== undefined) {
			clearTimeout(this._delayTimeoutHandle);
			this._delayTimeoutHandle = undefined;
		}
		if (this._tooltipNode) {
			document.body.removeChild(this._tooltipNode);
			this._tooltipNode = undefined;
		}
	}

	_renderTooltip():HTMLDivElement {
		var container = document.createElement('div');
		container.appendChild(document.createTextNode(this._text));
		container.classList.add('tooltip-container');
		return container;
	}

	_render():void {
		super._render();

		this._node = document.createElement('span');
		this._node.appendChild(document.createTextNode(this._text));
		this.on('pointerenter', this._enterHandler.bind(this));
		this.on('pointerleave', this._exitHandler.bind(this));
	}
}

module TooltipLabel {
	export interface Events extends SingleNodeWidget.Events {};
	export interface Getters extends SingleNodeWidget.Getters {
		(key:'delay'):number;
		(key:'text'):string;
	};
	export interface Setters extends SingleNodeWidget.Setters {
		(key:'delay', delay:number):void;
		(key:'text', text:string):void;
	};
}

export = TooltipLabel;
