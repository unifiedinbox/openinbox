/// <amd-dependency path="dojo/dom-form" />
/// <amd-dependency path="dojo/query" />
/// <amd-dependency path="dgrid/OnDemandGrid" />
/// <amd-dependency path="dstore/legacy/DstoreAdapter" />

import on = require('dojo/on');
import QueryResults = require('dojo/store/util/QueryResults');
import app = require('../../ui/app');
import FolderModel = require('../../../models/Folder');
import MessageModel = require('../../../models/Message');
import MessageStore = require('../../../models/stores/Message');
import TrackableMemory = require('../../../models/stores/TrackableMemory');
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
		if (!('map' in results)) {
			results = new QueryResults(results);
		}
		return results;
	}
});

FolderModel.setDefaultStore(new (<any> TrackableMemory)({
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
				formatter: function (isStarred:boolean) {
					return isStarred ? '&#x2605' : '&#x2606';
				},
				sortable: false
			},
			_isRead: {
				label: 'R',
				formatter: function (isRead:boolean) {
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
				formatter: function (hasAttachment:string) {
					return hasAttachment ? 'A' : '';
				},
				sortable: false
			},
			_avatar: {
				label: '',
				formatter: function (url:string) {
					return '<img src="' + url + '">';
				},
				sortable: false
			},
			_from: 'From',
			_to: 'To',
			_subject: 'Subject',
			_labels: {
				label: 'Labels',
				formatter: function (labels:string[]) {
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

	grid.on('.field-_isStarred:click', function (event:UIEvent) {
		var row = grid.row(event.target);
		row.data.set('isStarred', !row.data.get('isStarred'));
	});

	grid.on('.field-_isRead:click', function (event:UIEvent) {
		var row = grid.row(event.target);
		row.data.set('isRead', !row.data.get('isRead'));
	});

	document.body.appendChild(grid.domNode);
	grid.startup();

	(<any> window).grid = grid;
	(<any> window).store = MessageModel.store;
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
