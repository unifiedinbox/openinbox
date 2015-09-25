define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'dojo/_base/lang', 'mayhem/Promise', 'mayhem/WebApplication', 'app/ui/connections/GroupedConnectionList', 'app/models/Connection', 'app/models/stores/Connection', 'app/models/adapters/eType', 'app/util'], function (require, exports, assert, registerSuite, has, lang, Promise, WebApplication, GroupedConnectionList, Connection, ConnectionStore, eTypeAdapter, util) {
    var app;
    var connectionList;
    function createApp(kwArgs) {
        app = new WebApplication({
            name: 'Test',
            components: {
                i18n: { preload: ['app/nls/main'] },
                router: null,
                ui: { view: null },
                user: {
                    constructor: 'app/auth/User'
                }
            },
            apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT'
        });
        return app.run().then(function () {
            return app.get('user').login({ username: 'test', password: 'test' }).then(function () {
                Connection.setDefaultApp(app);
                Connection.setDefaultStore(new ConnectionStore({ app: app }));
                return util.removeAll(Connection.store).then(function () {
                    connectionList = new GroupedConnectionList(lang.mixin({ app: app, collection: Connection.store }, kwArgs));
                    app.get('ui').set('view', connectionList);
                });
            });
        });
    }
    function createConnection(kwArgs) {
        return new Connection(lang.mixin({}, {
            app: app,
            id: 1,
            account: 'bob@smith.com',
            name: 'Bob Smith',
            itemName: 'Bob Smith (bob@smith.com)',
            type: 'E'
        }, kwArgs));
    }
    function testSearch(search) {
        connectionList.set('search', search);
        eTypeAdapter.forEachConnectionType(function (connectionType) {
            var listView = connectionList.get('listViews')[connectionType];
            return listView.get('collection').fetch().totalLength.then(function (total) {
                var rows = connectionList.get('firstNode').querySelectorAll('.connection-type-' + connectionType + ' .dgrid-row');
                assert.strictEqual(total, rows.length);
            });
        });
    }
    registerSuite({
        name: 'app/ui/ConnectionList',
        'get/set tests': {
            beforeEach: function () {
                return createApp();
            },
            afterEach: function () {
                app.destroy();
            },
            displayName: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                return Connection.store.add(createConnection()).then(function () {
                    var identifierNode = connectionList.get('firstNode').querySelector('.identifier');
                    assert.strictEqual(identifierNode.textContent.trim(), 'bob@smith.com', 'Text in connection row should match what was set');
                });
            },
            emptyGroups: function () {
                if (!has('host-browser')) {
                    this.skip('requires browser');
                }
                return Connection.store.add(createConnection()).then(function () {
                    var node = connectionList.get('firstNode');
                    assert.strictEqual(node.querySelectorAll('.group-container').length, node.querySelectorAll('.group-container.is-hidden').length + 1, 'All but one group should be hidden (because there is only one item)');
                });
            }
        },
        'search and value tests': {
            beforeEach: function () {
                return createApp();
            },
            afterEach: function () {
                return util.removeAll(Connection.store).then(function () {
                    app.destroy();
                });
            },
            'search, successful values': function () {
                return Connection.store.add(createConnection()).then(function () {
                    return testSearch('bob');
                });
            },
            'search, unsuccessful values': function () {
                return Connection.store.add(createConnection()).then(function () {
                    return testSearch('fred');
                });
            },
            'value setter, verify selection and state of select-all widgets': function () {
                var connection1 = createConnection();
                var connection2 = createConnection({
                    id: 2,
                    account: 'john@doe.com',
                    type: 'M'
                });
                var connection3 = createConnection({
                    id: 3,
                    account: 'bob@smith.com',
                    type: 'M'
                });
                return Promise.all([
                    Connection.store.add(connection1),
                    Connection.store.add(connection2),
                    Connection.store.add(connection3)
                ]).then(function () {
                    var node = connectionList.get('firstNode');
                    var messages = app.get('i18n').get('messages');
                    connectionList.set('value', [connection1, connection3]);
                    assert.strictEqual(node.querySelectorAll('.ContactRow.selected').length, 2, '2 items should be selected');
                    assert.strictEqual(node.querySelector('.connection-type-facebook .select-all').textContent, messages.selectAll(), 'The select-all widget for facebook connections should reflect that not all are selected');
                    assert.strictEqual(node.querySelector('.connection-type-email .select-all').textContent, messages.selectNone(), 'The select-all widget for email connections should reflect that all are selected');
                });
            }
        }
    });
});
//# sourceMappingURL=GroupedConnectionList.js.map