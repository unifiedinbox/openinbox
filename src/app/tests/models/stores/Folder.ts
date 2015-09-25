/// <amd-dependency path="dojo/dom-form" />
/// <amd-dependency path="dojo/query" />
/// <amd-dependency path="dgrid/OnDemandGrid" />
/// <amd-dependency path="dstore/legacy/DstoreAdapter" />

import on = require('dojo/on');
import QueryResults = require('dojo/store/util/QueryResults');
import app = require('../../ui/app');
import FolderModel = require('../../../models/Folder');
import FolderStore = require('../../../models/stores/Folder');
import User = require('../../../auth/User');

// comment out this line to disable service mocks
import mocks = require('../../mocks/all'); mocks;

// There are no .d.ts declarations for these modules yet
var domForm:any = require('dojo/dom-form');
var OnDemandGrid:any = require('dgrid/OnDemandGrid');
var DstoreAdapter:any = require('dstore/legacy/DstoreAdapter');

// dstore #41407 (redmine)
var FixedAdapter:any = DstoreAdapter.createSubclass([], {
	query: function(query:any, options:any) {
		var results = this.inherited(arguments);
		if (!(results instanceof QueryResults)) {
			results = new QueryResults(results);
		}
		return results;
	}
});

FolderModel.setDefaultApp(app);
FolderModel.setDefaultStore(new FolderStore({ app: app }));

(<any> window).store = FolderModel.store;

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

	(<any> window).grid = grid;
}

app.run().then(function () {
	var user:User = <any> app.get('user');
	var sessionId = sessionStorage.getItem('uib-test-sessionId');
	var uibApplication = sessionStorage.getItem('uib-test-uibApplication');

	if (user && sessionId) {
		user.set('sessionId', sessionId);
		user.set('uibApplication', uibApplication);
		createGrid();
	}
});

on(document.getElementById('login'), 'submit', function (event) {
	// Note: Technically this is assuming that app.run finishes first (which is generally a safe assumption)

	event.preventDefault();
	var value = domForm.toObject(this);

	var user:User = <any> app.get('user');

	user.login({
		username: value.username,
		password: value.password
	}).then(function () {
		sessionStorage.setItem('uib-test-sessionId', user.get('sessionId'));
		sessionStorage.setItem('uib-test-uibApplication', user.get('uibApplication'));

		createGrid();
	});
});

export = app;
