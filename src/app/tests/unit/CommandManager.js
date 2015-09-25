define(["require", "exports", 'intern/chai!assert', 'intern!object', 'mayhem/Promise', '../../CommandManager'], function (require, exports, assert, registerSuite, Promise, CommandManager) {
    registerSuite({
        name: 'app/CommandManager',
        '.add': function () {
            var dfd = this.async(100);
            var sum = 0;
            var commandManager = new CommandManager();
            commandManager.add({
                command: {
                    commit: function (command) {
                        sum += 1;
                    },
                    rollback: function (command) {
                        sum -= 1;
                    }
                }
            });
            setTimeout(dfd.callback(function () {
                assert.strictEqual(sum, 1, 'Command object\'s "commit" method should have been called');
            }), 0);
        },
        '.add -> remove': function () {
            var dfd = this.async(100);
            var sum = 0;
            var commandManager = new CommandManager();
            var handle = commandManager.add({
                command: {
                    commit: function () {
                        sum += 1;
                    },
                    rollback: function () {
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
        '.add(): full queue': function () {
            var dfd = this.async(100);
            var sum = 0;
            var commandManager = new CommandManager({ queueLength: 1 });
            var handle = commandManager.add({
                command: {
                    commit: function () {
                        sum += 1;
                    },
                    rollback: function () {
                    }
                },
                delay: 20
            });
            var handle2 = commandManager.add({
                command: {
                    commit: function () {
                        sum += 5;
                    },
                    rollback: function () {
                    }
                },
                delay: 0
            });
            setTimeout(dfd.callback(function () {
                handle.remove();
                handle2.remove();
                assert.strictEqual(sum, 0, 'Neither command\'s "commit" method should have been called');
            }), 0);
        },
        '.add(): Promise': function () {
            var dfd = this.async(100);
            var str = '';
            var commandManager = new CommandManager({ queueLength: 1 });
            commandManager.add({
                command: {
                    commit: function () {
                        return new Promise(function (resolve) {
                            setTimeout(function () {
                                str += 'a';
                                resolve(str);
                            }, 1);
                        });
                    }
                }
            });
            commandManager.add({
                command: {
                    commit: dfd.callback(function () {
                        assert.strictEqual(str, 'a', 'Second command should execute after first command\'s promise resolves');
                        dfd.resolve();
                    })
                }
            });
        }
    });
});
//# sourceMappingURL=CommandManager.js.map