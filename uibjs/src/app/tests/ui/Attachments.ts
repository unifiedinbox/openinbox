/// <amd-dependency path="mayhem/templating/html!app/ui/Attachments.html" />

import Promise = require('mayhem/Promise');
import Container = require('mayhem/ui/Container');
import app = require('./app');
import Attachment = require('app/models/Attachment');
import AttachmentsViewModel = require('app/viewModels/Attachments');
import TrackableMemory = require('app/models/stores/TrackableMemory');
var Attachments = require<any>('mayhem/templating/html!app/ui/Attachments.html');

var store = <any> new TrackableMemory();
Attachment.setDefaultStore(store);

app.run().then(function () {
	var viewModel = new AttachmentsViewModel();
	var container = new Container({ app: app });

	viewModel.set('attachments', AttachmentsViewModel.Proxy.forCollection(store))

	container.add(new Attachments({
		app: app,
		model: viewModel
	}));

	app.get('ui').set('view', container);

	// Manually add a few models to the store for testing purposes
	return Promise.all([
		Attachment.store.add(new Attachment({
			app: app,
			name: 'test.jpg',
			type: 'image/jpeg',
			size: '1234',
			previewUrl: 'https://avatars2.githubusercontent.com/u/398379?v=3&s=72'
		})),
		Attachment.store.add(new Attachment({
			app: app,
			name: 'test.jpg',
			type: 'image/jpeg',
			size: '1234'
		}))
	]);
}).then(function () {
	// Set a flag for functional tests to poll on
	(<any> window).ready = true;
});

export = app;
