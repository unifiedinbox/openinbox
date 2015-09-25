define(["require", "exports", 'mayhem/ui/Container', './app', 'app/ui/AddAttachment', 'app/viewModels/Attachments', 'app/models/stores/TrackableMemory', "mayhem/templating/html!app/ui/Attachments.html"], function (require, exports, Container, app, AddAttachment, AttachmentsViewModel, TrackableMemory) {
    var Attachments = require('mayhem/templating/html!app/ui/Attachments.html');
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
    return app;
});
//# sourceMappingURL=AddAttachment.js.map