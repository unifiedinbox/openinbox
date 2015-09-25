var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'intern/chai!assert', 'intern!object', '../../../ui/app', 'dojo/_base/declare', 'dstore/Memory', 'mayhem/data/PersistentModel', 'app/models/stores/_StoreFilters'], function (require, exports, assert, registerSuite, app, declare, Memory, PersistentModel, _StoreFilters) {
    var Store = declare([Memory, _StoreFilters]);
    var MockModel = (function (_super) {
        __extends(MockModel, _super);
        function MockModel() {
            _super.apply(this, arguments);
        }
        return MockModel;
    })(PersistentModel);
    var MockModel;
    (function (MockModel) {
        ;
        ;
    })(MockModel || (MockModel = {}));
    MockModel.setDefaultApp(app);
    MockModel.setDefaultStore(new Store());
    registerSuite({
        name: 'app/models/stores/_StoreFilters',
        beforeEach: function () {
            resetData();
        },
        afterEach: function () {
            app.destroy();
        },
        '#exclude': {
            'exclude by ID': function () {
                var excluded = [1, 2, 3, 4, 5];
                var included = [0, 6, 7, 8, 9];
                var filtered = MockModel.store.exclude(excluded);
                return filtered.forEach(function (item) {
                    assert.notInclude(excluded, item.get('id'));
                    assert.include(included, item.get('id'));
                });
            },
            'exclude by arbitary property': function () {
                var toTestString = function (id) { return 'Test Item ' + id; };
                var excluded = [1, 2, 3, 4, 5].map(toTestString);
                var included = [0, 6, 7, 8, 9];
                var filtered = MockModel.store.exclude(excluded, 'name');
                return filtered.forEach(function (item) {
                    assert.notInclude(excluded, item.get('name'));
                    assert.include(included, item.get('id'));
                });
            }
        },
        '#include': {
            'include by ID': function () {
                var included = [1, 2, 3, 4, 5];
                var excluded = [0, 6, 7, 8, 9];
                var filtered = MockModel.store.include(included);
                return filtered.forEach(function (item) {
                    assert.include(included, item.get('id'));
                    assert.notInclude(excluded, item.get('id'));
                });
            },
            'include by arbitary property': function () {
                var toTestString = function (id) { return 'Test Item ' + id; };
                var included = [1, 2, 3, 4, 5].map(toTestString);
                var excluded = [0, 6, 7, 8, 9];
                var filtered = MockModel.store.include(included, 'name');
                return filtered.forEach(function (item) {
                    assert.include(included, item.get('name'));
                    assert.notInclude(excluded, item.get('id'));
                });
            }
        }
    });
    function resetData() {
        var data = ('0123456789'.split('')).map(function (count) {
            return {
                id: Number(count),
                name: 'Test Item ' + count
            };
        });
        MockModel.store.setData(data);
    }
});
//# sourceMappingURL=_StoreFilters.js.map