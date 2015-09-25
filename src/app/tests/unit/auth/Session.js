define(["require", "exports", 'intern/chai!assert', 'intern!object', '../../ui/app', 'app/auth/Session', 'app/models/RecentlyUsedFolder'], function (require, exports, assert, registerSuite, app, Session, RecentlyUsedFolder) {
    var session;
    var storageKey;
    RecentlyUsedFolder.setDefaultApp(app);
    registerSuite({
        name: 'auth/Session',
        beforeEach: function () {
            session = new Session({ userId: 0 });
            storageKey = session.get('storageKey');
        },
        afterEach: function () {
            localStorage.removeItem(storageKey);
            session.destroy();
        },
        'serialize with data': function () {
            var timestamp = new Date().getTime();
            session.get('recentlyUsedFolders').put(new RecentlyUsedFolder({
                id: 42,
                lastUsedDate: timestamp
            }));
            session.serialize();
            assert.strictEqual(localStorage.getItem(storageKey), JSON.stringify({
                recentlyUsedFolders: [
                    {
                        id: 42,
                        lastUsedDate: timestamp
                    }
                ]
            }));
        },
        'serialize with no data': function () {
            assert.strictEqual(localStorage.getItem(storageKey), null);
        },
        'deserialize with data': function () {
            var timestamp = new Date().getTime();
            localStorage.setItem(storageKey, JSON.stringify({
                recentlyUsedFolders: [
                    {
                        id: 42,
                        lastUsedDate: timestamp
                    }
                ]
            }));
            assert.strictEqual(session.get('recentlyUsedFolders').fetchSync().length, 0);
            session.deserialize();
            var recentFolders = session.get('recentlyUsedFolders').fetchSync();
            assert.strictEqual(recentFolders.length, 1);
            assert.strictEqual(recentFolders[0].get('id'), 42);
            assert.strictEqual(recentFolders[0].get('lastUsedDate'), timestamp);
        },
        'deserialize with no date': function () {
            assert.strictEqual(session.get('recentlyUsedFolders').fetchSync().length, 0);
            session.deserialize();
            var recentFolders = session.get('recentlyUsedFolders').fetchSync();
            assert.strictEqual(recentFolders.length, 0);
        }
    });
});
//# sourceMappingURL=Session.js.map