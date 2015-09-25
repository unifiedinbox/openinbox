define(["require", "exports", 'dojo/on', 'dojo/store/util/QueryResults', '../../ui/app', '../../../models/Folder', '../../../models/stores/Folder', '../../mocks/all', "dojo/dom-form", "dojo/query", "dgrid/OnDemandGrid", "dstore/legacy/DstoreAdapter"], function (require, exports, on, QueryResults, app, FolderModel, FolderStore, mocks) {
    mocks;
    var domForm = require('dojo/dom-form');
    var OnDemandGrid = require('dgrid/OnDemandGrid');
    var DstoreAdapter = require('dstore/legacy/DstoreAdapter');
    var FixedAdapter = DstoreAdapter.createSubclass([], {
        query: function (query, options) {
            var results = this.inherited(arguments);
            if (!(results instanceof QueryResults)) {
                results = new QueryResults(results);
            }
            return results;
        }
    });
    FolderModel.setDefaultApp(app);
    FolderModel.setDefaultStore(new FolderStore({ app: app }));
    window.store = FolderModel.store;
    function createGrid() {
        grid && grid.destroy();
        var grid = new OnDemandGrid({
            sort: '_id',
            store: new FixedAdapter(FolderModel.store),
            pagingDelay: 50,
            columns: {
                _id: {
                    label: 'ID',
                    sortable: false
                },
                _unreadMessageCount: {
                    label: 'Unread',
                    sortable: false
                },
                _name: {
                    label: 'Name',
                    sortable: false
                },
                _parentFolder: {
                    label: 'Parent',
                    sortable: false
                },
                _type: {
                    label: 'Type',
                    sortable: false
                }
            }
        });
        document.body.appendChild(grid.domNode);
        grid.startup();
        window.grid = grid;
    }
    app.run().then(function () {
        var user = app.get('user');
        var sessionId = sessionStorage.getItem('uib-test-sessionId');
        var uibApplication = sessionStorage.getItem('uib-test-uibApplication');
        if (user && sessionId) {
            user.set('sessionId', sessionId);
            user.set('uibApplication', uibApplication);
            createGrid();
        }
    });
    on(document.getElementById('login'), 'submit', function (event) {
        event.preventDefault();
        var value = domForm.toObject(this);
        var user = app.get('user');
        user.login({
            username: value.username,
            password: value.password
        }).then(function () {
            sessionStorage.setItem('uib-test-sessionId', user.get('sessionId'));
            sessionStorage.setItem('uib-test-uibApplication', user.get('uibApplication'));
            createGrid();
        });
    });
    return app;
});
//# sourceMappingURL=Folder.js.map