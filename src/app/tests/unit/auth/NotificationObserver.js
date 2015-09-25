var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'intern/chai!assert', 'intern!object', 'dojo/_base/declare', 'dojo/_base/lang', 'dstore/Memory', 'dstore/Trackable', 'mayhem/data/PersistentModel', '../../ui/app', 'app/auth/NotificationObserver', 'app/models/Notification'], function (require, exports, assert, registerSuite, declare, lang, Memory, Trackable, PersistentModel, app, NotificationObserver, Notification) {
    var TestModel = (function (_super) {
        __extends(TestModel, _super);
        function TestModel() {
            _super.apply(this, arguments);
        }
        return TestModel;
    })(PersistentModel);
    TestModel.setDefaultApp(app);
    TestModel.setDefaultStore(new (declare([Memory, Trackable]))());
    Notification.setDefaultApp(app);
    var observer;
    var data;
    registerSuite({
        name: 'app/auth/NotificationObserver',
        'method tests': {
            beforeEach: function () {
                observer = setData();
            },
            add: function () {
                observer.add(data);
                assert.equal(observer.get('queue').length, 10, 'New items should be added to a queue.');
                return TestModel.store.fetch().then(function (items) {
                    assert.equal(items.length, 0, 'New items should not be added to their store.');
                });
            },
            commit: function () {
                observer.add(data);
                return observer.commit().then(function () {
                    return TestModel.store.fetch().then(function (items) {
                        assert.equal(items.length, 10, 'Committed items should be added to their store.');
                    });
                });
            }
        }
    });
    function setData(kwArgs) {
        data = [];
        for (var i = 0; i < 10; i++) {
            data.push(new Notification({
                id: i,
                item: new TestModel({
                    id: i,
                    isRead: false,
                    folderid: 0
                })
            }));
        }
        return new NotificationObserver(lang.mixin({}, kwArgs, {
            collection: TestModel.store
        }));
    }
});
//# sourceMappingURL=NotificationObserver.js.map