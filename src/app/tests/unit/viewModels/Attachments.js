define(["require", "exports", 'intern/chai!assert', 'intern!object', 'mayhem/WebApplication', 'app/models/Attachment', 'app/viewModels/Attachments', "mayhem/templating/html!app/ui/Attachments.html"], function (require, exports, assert, registerSuite, WebApplication, Attachment, ViewModel) {
    var app;
    var viewModel = new ViewModel();
    var id;
    var item;
    function createApp(kwArgs) {
        app = new WebApplication({
            name: 'Test',
            components: {
                i18n: { preload: ['app/nls/main'] },
                router: null,
                ui: { view: null }
            }
        });
        return app.run();
    }
    registerSuite({
        name: 'app/viewModels/Attachments',
        before: function () {
            return createApp();
        },
        beforeEach: function () {
            item = new ViewModel.Proxy({ target: new Attachment({
                app: app
            }) });
        },
        after: function () {
            app.destroy();
        },
        'iconClass (and extension) getter': function () {
            var fileExtensions = ViewModel.fileExtensions;
            for (var extension in fileExtensions) {
                item.set('name', 'test.' + extension);
                assert.strictEqual(item.get('extension'), extension, 'extension getter should return the filename\'s extension');
                assert.strictEqual(item.get('iconClass'), 'icon-app-file-' + fileExtensions[extension], 'iconClass getter should return the expected CSS class name');
            }
            item.set('name', 'test.unrecognizable');
            assert.strictEqual(item.get('iconClass'), item.get('defaultIconClass'), 'Unrecognized file extension should generate default iconClass');
        },
        readableSize: function () {
            var units = ['kb', 'mb', 'gb'];
            var messages = app.get('i18n').get('messages');
            item.set('size', 1023);
            assert.strictEqual(item.get('readableSize'), '1023 ' + messages.b(), 'size under 1KB (1024 B) should be expressed in bytes');
            for (var i = 0, length = units.length; i < length; i++) {
                var size = Math.pow(1024, i + 1);
                item.set('size', size);
                assert.strictEqual(item.get('readableSize'), '1 ' + messages[units[i]]());
                item.set('size', Math.round(size * 1.6));
                assert.strictEqual(item.get('readableSize'), '2 ' + messages[units[i]]());
            }
            item.set('size', Math.pow(1024, 4));
            assert.strictEqual(item.get('readableSize'), '1 ' + messages['tb']());
            item.set('size', Math.pow(1024, 5));
            assert.strictEqual(item.get('readableSize'), '1024 ' + messages['tb']());
        }
    });
});
//# sourceMappingURL=Attachments.js.map