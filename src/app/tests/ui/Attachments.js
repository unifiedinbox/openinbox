define(["require", "exports", 'mayhem/Promise', 'mayhem/ui/Container', './app', 'app/models/Attachment', 'app/viewModels/Attachments', 'app/models/stores/TrackableMemory', "mayhem/templating/html!app/ui/Attachments.html"], function (require, exports, Promise, Container, app, Attachment, AttachmentsViewModel, TrackableMemory) {
    var Attachments = require('mayhem/templating/html!app/ui/Attachments.html');
    var store = new TrackableMemory();
    Attachment.setDefaultStore(store);
    app.run().then(function () {
        var viewModel = new AttachmentsViewModel();
        var container = new Container({ app: app });
        viewModel.set('attachments', AttachmentsViewModel.Proxy.forCollection(store));
        container.add(new Attachments({
            app: app,
            model: viewModel
        }));
        app.get('ui').set('view', container);
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
        window.ready = true;
    });
    return app;
});
//# sourceMappingURL=Attachments.js.map