var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'mayhem/ui/Label', 'mayhem/ui/ListView', 'mayhem/ui/dom/SingleNodeWidget', 'mayhem/util', './Alert', '../models/Alert', '../CommandManager', './Icon'], function (require, exports, Label, ListView, SingleNodeWidget, util, Alert, AlertModel, CommandManager, Icon) {
    var DEFAULT_ALERT_LIMIT = 5;
    var DEFAULT_ALERT_TIMEOUT = 5000;
    var AlertList = (function (_super) {
        __extends(AlertList, _super);
        function AlertList(kwArgs) {
            util.deferSetters(this, ['collection'], '_render');
            _super.call(this, kwArgs);
            this._commandManager = new CommandManager({
                delay: this.get('duration')
            });
        }
        AlertList.prototype._collectionGetter = function () {
            return this._collection;
        };
        AlertList.prototype._collectionSetter = function (collection) {
            this._collection = collection;
            if (collection) {
                this._listView.set('collection', this._collection);
            }
        };
        AlertList.prototype._isAttachedGetter = function () {
            return this._isAttached;
        };
        AlertList.prototype._isAttachedSetter = function (value) {
            this._listView.set('isAttached', value);
            this._isAttached = value;
        };
        AlertList.prototype._initialize = function () {
            _super.prototype._initialize.call(this);
            this._maximumLength = DEFAULT_ALERT_LIMIT;
            this._duration = DEFAULT_ALERT_TIMEOUT;
            this._className = 'AlertList';
            this._queuedAlerts = [];
            this._handlesByAlertId = {};
        };
        AlertList.prototype._render = function () {
            var listViewNode;
            this._node = document.createElement('div');
            this._node.className = this.get('className');
            this._listView = new ListView({
                app: this.get('app'),
                parent: this,
                itemConstructor: Alert
            });
            listViewNode = this._listView.detach();
            listViewNode.classList.add('dgrid-autoheight');
            this._node.appendChild(listViewNode);
            this.on('activate', this._clickHandler.bind(this));
        };
        AlertList.prototype.add = function (alertArgs) {
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
                    })).then(function (alertModel) {
                        var handle;
                        if (!alertModel.get('isPermanent')) {
                            handle = self._commandManager.add({
                                command: {
                                    commit: function (command) {
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
        };
        AlertList.prototype._next = function () {
            if (this._queuedAlerts.length) {
                this.add(this._queuedAlerts.shift());
            }
        };
        AlertList.prototype._clickHandler = function (event) {
            if (!(event.target instanceof Label || event.target instanceof Icon)) {
                return;
            }
            var alertModel = event.target.get('parent').get('model');
            var command = alertModel.get('command');
            var alertId = alertModel.get('id');
            var handle = this._handlesByAlertId[alertId];
            AlertModel.store.remove(alertId);
            handle && handle.remove();
            delete this._handlesByAlertId[alertId];
            this._next();
            if (event.target instanceof Label) {
                if (event.target.get('type') === 1 /* Undo */) {
                    if (command && command.rollback) {
                        command.rollback(command);
                    }
                }
                else if (event.target.get('type') === 0 /* Commit */) {
                    if (command && command.commit) {
                        command.commit(command);
                    }
                }
            }
            else {
                if (!alertModel.get('commitLabel') && command && command.commit) {
                    command.commit(command);
                }
            }
        };
        return AlertList;
    })(SingleNodeWidget);
    return AlertList;
});
//# sourceMappingURL=AlertList.js.map