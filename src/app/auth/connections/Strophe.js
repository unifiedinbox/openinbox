var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'strophe/Base64', 'strophe/strophe', 'mayhem/Observable', '../../endpoints'], function (require, exports, Base64, Strophe, Observable, endpoints) {
    var statusMap = {
        1: '_setIsConnecting',
        2: '_setIsConnecting',
        4: '_reauthorize',
        5: '_onSuccess',
        6: 'reconnect',
        7: '_setIsConnecting',
        8: '_onSuccess'
    };
    var StropheConnection = (function (_super) {
        __extends(StropheConnection, _super);
        function StropheConnection() {
            _super.apply(this, arguments);
        }
        StropheConnection.prototype.connect = function () {
            var data = this._connectionData;
            var jid = data.jid && String(data.jid);
            var onConnect = this._onConnect.bind(this);
            var endpoint = (location.protocol === 'http:') ? endpoints.boshHttpService : endpoints.boshService;
            this._connection = new Strophe.Connection(endpoint);
            if (data.session) {
                this._connection.connect(jid, Base64.decode(data.session), onConnect);
            }
            else {
                this._connection.attach(jid, String(data.sid), String(parseInt(data.rid, 10) + 1), onConnect);
            }
        };
        StropheConnection.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._responseHandles = null;
            this.disconnect();
        };
        StropheConnection.prototype.disconnect = function () {
            if (this._connection) {
                this._removeHandles();
                this._connection.disconnect();
                this._connection = null;
            }
        };
        StropheConnection.prototype.dispatch = function (message) {
            var type = message.getAttribute('type');
            var idNodes = message.getElementsByTagName('id');
            var id = Strophe.getText(idNodes[0]);
            var handles = this._responseHandles;
            Object.keys(handles).forEach(function (key) {
                var callbacks = handles[key];
                if (callbacks && callbacks.length) {
                    callbacks.forEach(function (handle) {
                        handle({
                            type: type,
                            id: Number(id)
                        });
                    });
                }
            });
            return true;
        };
        StropheConnection.prototype._initialize = function () {
            this._attemptCount = 0;
            this._maxAttemptCount = 4;
        };
        StropheConnection.prototype.reconnect = function () {
            this._attemptCount += 1;
            this.disconnect();
            if (this._attemptCount <= this._maxAttemptCount) {
                this.connect();
            }
        };
        StropheConnection.prototype._onConnect = function (statusIndex) {
            var method = statusMap[statusIndex];
            if (method) {
                this[method](status);
            }
        };
        StropheConnection.prototype._onSuccess = function () {
            var _this = this;
            Object.keys(this._responseHandles).forEach(function (key) {
                _this._connection.addHandler(_this.dispatch.bind(_this), null, key);
            });
        };
        StropheConnection.prototype._reauthorize = function () {
            if (!this._reauthAttempted) {
                this._reauthAttempted = true;
                this.reconnect();
            }
        };
        StropheConnection.prototype._removeHandles = function () {
            this._connection.deleteHandler(this._onConnect.bind(this));
            this._connection.deleteHandler(this.dispatch.bind(this));
        };
        StropheConnection.prototype._setIsConnecting = function (status) {
            this._isConnecting = (status === 'CONNECTING');
        };
        return StropheConnection;
    })(Observable);
    return StropheConnection;
});
//# sourceMappingURL=Strophe.js.map