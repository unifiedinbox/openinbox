define(["require", "exports", 'dojo/on', 'dojo/store/util/QueryResults', '../../ui/app', '../../../models/Folder', '../../../models/Message', '../../../models/stores/Message', '../../../models/stores/TrackableMemory', '../../mocks/all', "dojo/dom-form", "dojo/query", "dgrid/OnDemandGrid", "dstore/legacy/DstoreAdapter"], function (require, exports, on, QueryResults, app, FolderModel, MessageModel, MessageStore, TrackableMemory, mocks) {
    mocks;
    var domForm = require('dojo/dom-form');
    var OnDemandGrid = require('dgrid/OnDemandGrid');
    var DstoreAdapter = require('dstore/legacy/DstoreAdapter');
    var FixedAdapter = DstoreAdapter.createSubclass([], {
        query: function (query, options) {
            var results = this.inherited(arguments);
            if (!('map' in results)) {
                results = new QueryResults(results);
            }
            return results;
        }
    });
    FolderModel.setDefaultStore(new TrackableMemory({
        app: app,
        data: [
            new FolderModel({ app: app, id: 5, name: 'Inbox', unreadMessageCount: 10 }),
            new FolderModel({ app: app, id: 162, name: 'Files', unreadMessageCount: 5 })
        ]
    }));
    MessageModel.setDefaultApp(app);
    MessageModel.setDefaultStore(new MessageStore({ app: app }));
    function createGrid() {
        grid && grid.destroy();
        var grid = new OnDemandGrid({
            sort: '_id',
            store: new FixedAdapter(MessageModel.store),
            query: {
                folderid: 5
            },
            pagingDelay: 50,
            columns: {
                _isStarred: {
                    label: 'S',
                    formatter: function (isStarred) {
                        return isStarred ? '&#x2605' : '&#x2606';
                    },
                    sortable: false
                },
                _isRead: {
                    label: 'R',
                    formatter: function (isRead) {
                        return isRead ? 'R' : 'U';
                    },
                    sortable: false
                },
                _priority: {
                    label: 'P',
                    sortable: false
                },
                _hasAttachment: {
                    label: 'A',
                    formatter: function (hasAttachment) {
                        return hasAttachment ? 'A' : '';
                    },
                    sortable: false
                },
                _avatar: {
                    label: '',
                    formatter: function (url) {
                        return '<img src="' + url + '">';
                    },
                    sortable: false
                },
                _from: 'From',
                _to: 'To',
                _subject: 'Subject',
                _labels: {
                    label: 'Labels',
                    formatter: function (labels) {
                        if (labels.length) {
                            return labels.join(', ');
                        }
                        else {
                            return '';
                        }
                    },
                    sortable: false
                }
            }
        });
        grid.on('.field-_isStarred:click', function (event) {
            var row = grid.row(event.target);
            row.data.set('isStarred', !row.data.get('isStarred'));
        });
        grid.on('.field-_isRead:click', function (event) {
            var row = grid.row(event.target);
            row.data.set('isRead', !row.data.get('isRead'));
        });
        document.body.appendChild(grid.domNode);
        grid.startup();
        window.grid = grid;
        window.store = MessageModel.store;
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
//# sourceMappingURL=Message.js.map