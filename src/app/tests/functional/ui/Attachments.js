define(["require", "exports", 'intern/chai!assert', 'intern!object', "intern/dojo/node!leadfoot/helpers/pollUntil"], function (require, exports, assert, registerSuite) {
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');
    registerSuite({
        name: 'app/ui/Attachments',
        beforeEach: function () {
            return this.remote.get(require.toUrl('../../ui/Attachments.html')).then(pollUntil(function () {
                return window.ready;
            }, null, 5000));
        },
        previewUrl: function () {
            return this.remote.findByCssSelector('.Attachments-item:first-child').findByCssSelector('.Attachments-image').getAttribute('style').then(function (style) {
                assert.notStrictEqual(style.indexOf('background-image'), -1, 'First attachment on page should contain image preview using background-image');
            }).end(2);
        },
        'no previewUrl': function () {
            return this.remote.findByCssSelector('.Attachments-item:last-child').findByCssSelector('[class^="icon-app-file-"]').end(2);
        },
        'delete': function () {
            return this.remote.findAllByCssSelector('.Attachments-item').then(function (elements) {
                assert.strictEqual(elements.length, 2, 'Expected 2 items on the page initially');
            }).end().findByCssSelector('.Attachments-item:last-child').findByCssSelector('.icon-app-menu').click().end(2).findByCssSelector('.DropDownContainer.open .icon-app-delete').click().end().findAllByCssSelector('.Attachments-item').then(function (elements) {
                assert.strictEqual(elements.length, 1, 'Expected 1 item on the page after removal');
            }).end();
        }
    });
});
//# sourceMappingURL=Attachments.js.map