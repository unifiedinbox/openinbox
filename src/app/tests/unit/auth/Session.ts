import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import app = require('../../ui/app');
import Session = require('app/auth/Session');
import RecentlyUsedFolder = require('app/models/RecentlyUsedFolder');

var session:Session;
var storageKey:string;

// Reset the default app on all models to the imported `app` above to avoid `undefinedModule` errors.
RecentlyUsedFolder.setDefaultApp(app);

registerSuite({
    name: 'auth/Session',

    beforeEach() {
        session = new Session({ userId: 0 });
        storageKey = session.get('storageKey');
    },

    afterEach() {
        localStorage.removeItem(storageKey);
        session.destroy();
    },

    'serialize with data'() {
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

    'serialize with no data'() {
        assert.strictEqual(localStorage.getItem(storageKey), null);
    },

    'deserialize with data'() {
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

    'deserialize with no date'() {
        assert.strictEqual(session.get('recentlyUsedFolders').fetchSync().length, 0);

        session.deserialize();

        var recentFolders = session.get('recentlyUsedFolders').fetchSync();
        assert.strictEqual(recentFolders.length, 0);
    }
});
