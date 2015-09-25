define(["require", "exports"], function (require, exports) {
    var DEFAULT_QUEUE_LENGTH = Infinity;
    var DEFAULT_DELAY = 0;
    var CommandManager = (function () {
        function CommandManager(kwArgs) {
            if (kwArgs === void 0) { kwArgs = {}; }
            this._queueLength = kwArgs.queueLength || DEFAULT_QUEUE_LENGTH;
            this._delay = kwArgs.delay || DEFAULT_DELAY;
            this._activeCommands = [];
            this._queuedCommands = [];
        }
        CommandManager.prototype.add = function (kwArgs) {
            var commandManager = this;
            var queuedCommand = {
                command: kwArgs.command,
                delay: kwArgs.delay || this._delay,
                handle: { remove: null }
            };
            if (this._activeCommands.length < this._queueLength) {
                this._activateCommand(queuedCommand);
            }
            else {
                this._queuedCommands.push(queuedCommand);
                queuedCommand.handle.remove = function () {
                    if (this._removed) {
                        return queuedCommand.command;
                    }
                    commandManager._queuedCommands.splice(commandManager._queuedCommands.indexOf(queuedCommand), 1);
                    this._removed = true;
                    try {
                        queuedCommand.command.rollback(queuedCommand.command);
                    }
                    finally {
                        return queuedCommand.command;
                    }
                };
            }
            return queuedCommand.handle;
        };
        CommandManager.prototype._activateCommand = function (queuedCommand) {
            var self = this;
            var timer;
            this._activeCommands.push(queuedCommand);
            timer = setTimeout(function () {
                var commitValue;
                var executeNext;
                self._activeCommands.splice(self._activeCommands.indexOf(queuedCommand), 1);
                queuedCommand.handle.remove = function () {
                    return null;
                };
                try {
                    commitValue = queuedCommand.command.commit(queuedCommand.command);
                }
                finally {
                    if (commitValue && typeof commitValue.always === 'function') {
                        executeNext = function () {
                            self._next();
                        };
                        commitValue.always(executeNext);
                    }
                    else {
                        self._next();
                    }
                }
            }, queuedCommand.delay);
            queuedCommand.handle.remove = function () {
                if (this._removed) {
                    return queuedCommand.command;
                }
                clearTimeout(timer);
                self._activeCommands.splice(self._activeCommands.indexOf(queuedCommand), 1);
                this._removed = true;
                try {
                    if (typeof queuedCommand.command.rollback === 'function') {
                        queuedCommand.command.rollback(queuedCommand.command);
                    }
                }
                finally {
                    return queuedCommand.command;
                }
            };
        };
        CommandManager.prototype._next = function () {
            if (this._queuedCommands.length) {
                this._activateCommand(this._queuedCommands.shift());
            }
        };
        return CommandManager;
    })();
    ;
    return CommandManager;
});
//# sourceMappingURL=CommandManager.js.map