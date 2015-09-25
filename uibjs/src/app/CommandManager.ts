/*
 * `IQueuedCommand` includes an ICommand and additional metadata needed for queue management
 */
interface IQueuedCommand {
	command:CommandManager.ICommand;
	delay?:number;
	handle?:IHandle;
}

module CommandManager {
	/**
	 * An `ICommand` instance must be provided to `CommandManager#add`. Error-handling logic should be implemented
	 * internally within the functions supplied on the `commit` and `rollback` properties.
	 * Once `CommandManager` calls `commit`, calling `remove` on the handle returned by `CommandManager#add` will not
	 * call `rollback`. If a failure condition is detected within the execution of `commit`, you can manually invoke
	 * the `rollback` logic using the `ICommand` object passed as the sole parameter to `commit`.
	 */
	export interface ICommand {
		commit?:ICallback;
		rollback?:ICallback;
	}

	export interface KwArgs {
		queueLength?:number;
		delay?:number;
	}

	export interface ICallback {
		(command:ICommand):any;
	}

	export interface AddArgs {
		command:ICommand;
		delay?:number;
	}
}

var DEFAULT_QUEUE_LENGTH = Infinity;
var DEFAULT_DELAY = 0;

/**
 * The CommandManager class provides a mechanism for queueing commands for execution. Execution is controlled by
 * the queue size and a delay value.
 *
 * Queue size: by default, any number of commands can be activated simultaneously. If you specify a queue size then
 * the CommandManager will limit concurrent scheduling of commands to that amount. An 'activated' command has had a
 * timer created and will execute when the specified delay has elapsed (zero-delay commands are not executed
 * immediately, but rather at the next turn of the interpreter via `setTimeout(fn, 0)`).
 *
 * Delay value: a CommandManager instance can have a delay value specified (default=0); each command can specify an
 * individual delay value as well. Commands with no delay specified will use the CommandManager instance's delay.
 * `CommandManager#add()` returns a handle with a `remove` method. If `remove` is called before the delay has elapsed,
 * the timer will be cleared and the command's `commit` function will not be executed. If specified, the command's
 * `rollback` function will instead be executed.
 * If `remove` is called after the command has already been executed it will return null.
 */
class CommandManager {
	private _activeCommands:IQueuedCommand[];
	private _queuedCommands:IQueuedCommand[];
	private _queueLength:number;
	private _delay:number;

	constructor(kwArgs:CommandManager.KwArgs = {}) {
		this._queueLength = kwArgs.queueLength || DEFAULT_QUEUE_LENGTH;
		this._delay = kwArgs.delay || DEFAULT_DELAY;
		this._activeCommands = [];
		this._queuedCommands = [];
	}

	add(kwArgs:CommandManager.AddArgs):IHandle {
		var commandManager = this;
		var queuedCommand:IQueuedCommand = {
			command: kwArgs.command,
			delay: kwArgs.delay || this._delay,
			// Create a handle with a stub 'remove' method so that we can return a reference to the handle immediately
			// and define the logic for the 'remove' method later
			handle: { remove: null }
		};

		if (this._activeCommands.length < this._queueLength) {
			this._activateCommand(queuedCommand);
		}
		else {
			this._queuedCommands.push(queuedCommand);

			queuedCommand.handle.remove = function():CommandManager.ICommand {
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
			}
		}

		return queuedCommand.handle;
	}

	private _activateCommand(queuedCommand:IQueuedCommand) {
		var self = this;
		var timer:number;
		this._activeCommands.push(queuedCommand);

		timer = setTimeout(function () {
			var commitValue:any;
			var executeNext:Function;

			self._activeCommands.splice(self._activeCommands.indexOf(queuedCommand), 1);
			queuedCommand.handle.remove = function ():CommandManager.ICommand {
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

		queuedCommand.handle.remove = function ():CommandManager.ICommand {
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
		}
	}

	private _next() {
		if (this._queuedCommands.length) {
			this._activateCommand(this._queuedCommands.shift());
		}
	}
};

export = CommandManager;
