define(["require", "exports", 'intern/chai!assert', 'intern!object', 'app/has', 'dojo/_base/lang', 'mayhem/WebApplication', "mayhem/templating/html!./DropDownTemplate.html"], function (require, exports, assert, registerSuite, has, lang, WebApplication) {
    var DropDown;
    DropDown = require('mayhem/templating/html!./DropDownTemplate.html');
    var app;
    var dropDown;
    var className;
    registerSuite({
        name: 'app/ui/Avatar',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        dropDownClassName: function () {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }
            assert.isNotNull(document.querySelector('.' + className));
        },
        isOpen: function () {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }
            var node = document.querySelector('.' + className);
            assert.isFalse(node.classList.contains('open'), 'DropDown should be closed by default.');
            dropDown.set('isOpen', true);
            assert.isTrue(node.classList.contains('open'), 'When `isOpen` is true, the drop down container should have an `open` class.');
        }
    });
    function createApp(kwArgs) {
        app = new WebApplication({
            name: 'Test',
            components: {
                router: null,
                ui: { view: null }
            }
        });
        return app.run().then(function () {
            className = 'DropDownContainer--' + String(Date.now());
            dropDown = new DropDown(lang.mixin({}, kwArgs, { app: app, dropDownClassName: className }));
            app.get('ui').set('view', dropDown);
        });
    }
});
//# sourceMappingURL=DropDown.js.map