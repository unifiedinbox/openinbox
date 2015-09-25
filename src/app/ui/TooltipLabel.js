var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util'], function (require, exports, SingleNodeWidget, util) {
    var TooltipLabel = (function (_super) {
        __extends(TooltipLabel, _super);
        function TooltipLabel(kwArgs) {
            util.deferSetters(this, ['text'], '_render');
            _super.call(this, kwArgs);
        }
        TooltipLabel.prototype._textGetter = function () {
            return this._text;
        };
        TooltipLabel.prototype._textSetter = function (text) {
            this._text = text;
            if (this._node.firstChild) {
                this._node.removeChild(this._node.firstChild);
            }
            this._node.appendChild(document.createTextNode(this._text));
        };
        TooltipLabel.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._delay = 1000;
        };
        TooltipLabel.prototype._enterHandler = function (event) {
            var self = this;
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
        };
        TooltipLabel.prototype._exitHandler = function () {
            if (this._delayTimeoutHandle !== undefined) {
                clearTimeout(this._delayTimeoutHandle);
                this._delayTimeoutHandle = undefined;
            }
            if (this._tooltipNode) {
                document.body.removeChild(this._tooltipNode);
                this._tooltipNode = undefined;
            }
        };
        TooltipLabel.prototype._renderTooltip = function () {
            var container = document.createElement('div');
            container.appendChild(document.createTextNode(this._text));
            container.classList.add('tooltip-container');
            return container;
        };
        TooltipLabel.prototype._render = function () {
            _super.prototype._render.call(this);
            this._node = document.createElement('span');
            this._node.appendChild(document.createTextNode(this._text));
            this.on('pointerenter', this._enterHandler.bind(this));
            this.on('pointerleave', this._exitHandler.bind(this));
        };
        return TooltipLabel;
    })(SingleNodeWidget);
    var TooltipLabel;
    (function (TooltipLabel) {
        ;
        ;
        ;
    })(TooltipLabel || (TooltipLabel = {}));
    return TooltipLabel;
});
//# sourceMappingURL=TooltipLabel.js.map