/// <amd-dependency path="mayhem/templating/html!app/ui/Attachments.html" />

import Container = require('mayhem/ui/Container');
import app = require('./app');
import AddAttachment = require('app/ui/AddAttachment');
import AttachmentsViewModel = require('app/viewModels/Attachments');
import TrackableMemory = require('app/models/stores/TrackableMemory');

var Attachments = require<any>('mayhem/templating/html!app/ui/Attachments.html');

var attachmentStore = new TrackableMemory({
	app: app
});

app.run().then(function () {
	var viewModel = new AttachmentsViewModel({
		app: app,
		attachments: attachmentStore
	});
	var container = new Container({ app: app });

	container.add(new AddAttachment({
		app: app,
		collection: viewModel.get('attachments')
	}));

	container.add(new Attachments({
		app: app,
		model: viewModel
	}));

	app.get('ui').set('view', container);
});

export = app;
