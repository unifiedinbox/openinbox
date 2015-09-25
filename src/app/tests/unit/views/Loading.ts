/// <amd-dependency path="mayhem/templating/html!app/views/Loading.html" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
import has = require('app/has');
import lang = require('dojo/_base/lang');
import LoadingViewModel = require('app/viewModels/Loading');
import WebApplication = require('mayhem/WebApplication');

var Loading = require <any> ('mayhem/templating/html!app/views/Loading.html');

var app:WebApplication;
var loading:any;

function createApp(kwArgs?:HashMap<any>) {
    app = new WebApplication({
        name: 'Test',
        components: {
            router: null,
            ui: { view: null }
        }
    });

    return app.run().then(function () {
        loading = new Loading({
            app: app,
            model: new LoadingViewModel(kwArgs)
        });
        app.get('ui').set('view', loading);
    });
}

function testTextContent(selector:string, expectedValue:string) {
    // Searches for a selector under the root node in the widget's template, and trims its contents for comparison.
    // TODO: might want to put this in a util module.
    var node = loading.get('firstNode').nextSibling.querySelector(selector);
    assert.strictEqual(expectedValue, node.textContent.trim());
}

registerSuite({
    name: 'app/ui/Loading',

    'get/set tests': {
        beforeEach() {
            return createApp();
        },

        afterEach() {
            app.destroy();
        },

        authorBlank() {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }

            testTextContent('.Loading-author', '');
        },

        messageBlank() {
            if (!has('host-browser')) {
                this.skip('requires browser');
            }

            testTextContent('.Loading-message', '');
        }
    },

    'initialization tests': {
        // Tests in this suite are each responsible for creating their own app/ui/Loading

        afterEach() {
            app.destroy();
        },

        'author set'() {
            return createApp({
                author: 'bob smith'
            }).then(function () {
                testTextContent('.Loading-author', 'bob smith');
            });
        },

        'message set'() {
            return createApp({
                message: 'here is a message'
            }).then(function () {
                testTextContent('.Loading-message', 'here is a message');
            });
        }
    }
});
