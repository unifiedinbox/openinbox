import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import Promise = require('mayhem/Promise');
import CommandManager = require('../../CommandManager');

registerSuite({
	name: 'app/CommandManager',

	'.add'() {
		var dfd = this.async(100);
		var sum = 0;
		var commandManager = new CommandManager();

		commandManager.add({
			command: {
				commit(command:CommandManager.ICommand) {
					sum += 1;
				},
				rollback(command:CommandManager.ICommand) {
					sum -= 1;
				}
			}
		});

		setTimeout(dfd.callback(function () {
			assert.strictEqual(sum, 1, 'Command object\'s "commit" method should have been called')
		}), 0);
	},

	'.add -> remove'() {
		var dfd = this.async(100);
		var sum = 0;
		var commandManager = new CommandManager();
		var handle = commandManager.add({
			command: {
				commit() {
					sum += 1;
				},
				rollback() {
					sum -= 1;
				}
			},
			delay: 20
		});

		handle.remove();

		setTimeout(dfd.callback(function () {
			assert.strictEqual(sum, -1, 'Command object\'s "rollback" method should have been called');
		}), 0);
	},

	'.add(): full queue'() {
		var dfd = this.async(100);
		var sum = 0;
		var commandManager = new CommandManager({ queueLength: 1 });
		// this command fills up the queue and has a delay
		var handle = commandManager.add({
			command: {
				commit() {
					sum += 1;
				},
				rollback() {}
			},
			delay: 20
		});

		// this command has no delay, but should not execute because the queue is full
		var handle2 = commandManager.add({
			command: {
				commit() {
					sum += 5;
				},
				rollback() {}
			},
			delay: 0
		});

		setTimeout(dfd.callback(function () {
			handle.remove();
			handle2.remove();
			assert.strictEqual(sum, 0, 'Neither command\'s "commit" method should have been called');
		}), 0);
	},

	'.add(): Promise'() {
		var dfd = this.async(100);
		var str = '';
		var commandManager = new CommandManager({ queueLength: 1 });

		// command 1
		commandManager.add({
			// This command has no delay, but returns a promise
			// If CommandManager fails to handle promises correctly, it will pop this command from the active
			// queue immediately and enqueue command 2, which will execute immediately since it has no delay.
			// If command 2 runs before command 1 completes then the variable `str` will still be empty.
			// If the promise is handled correctly, command 2 will not be enqueued until after the promise resolves,
			// so the value in `str` will be 'a'.
			command: {
				commit() {
					return new Promise(function (resolve) {
						setTimeout(function () {
							str += 'a';
							resolve(str);
						}, 1);
					});
				}
			}
		});

		// command 2
		commandManager.add({
			command: {
				commit: dfd.callback(function () {
					assert.strictEqual(str, 'a',
						'Second command should execute after first command\'s promise resolves');
					dfd.resolve();
				})
			}
		});
	}
});
