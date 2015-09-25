define(["require", "exports", '../app', 'app/models/Folder', '../../mocks/Login', 'app/models/Message', 'app/viewModels/MessageList', './mockMessageData', 'dojo/on', 'mayhem/Promise', '../../support/scenarios/Message', "mayhem/templating/html!./MessageRowTestPageTemplate.html"], function (require, exports, app, Folder, LoginServiceMock, Message, MessageProxy, mocks, on, Promise, MessageScenarios) {
    LoginServiceMock;
    MessageScenarios;
    var View = require('mayhem/templating/html!./MessageRowTestPageTemplate.html');
    app.run().then(function () {
        var user = app.get('user');
        user.login({
            username: 'test',
            password: 'pass'
        }).then(function () {
            Promise.all([
                mocks.folders(),
                mocks.attachments(),
                mocks.contacts(),
                mocks.messages()
            ]).then(function () {
                user.set('folders', Folder.store);
                Message.get(0).then(function (message) {
                    var messageProxy = new MessageProxy({
                        target: message
                    });
                    messageProxy.set('attachments', message.get('attachments'));
                    var view = new View({
                        app: app,
                        model: messageProxy
                    });
                    app.get('ui').set('view', view);
                    on(document.getElementById('toggleAttachments'), 'click', function () {
                        messageProxy.set('isFiltered', !messageProxy.get('isFiltered'));
                    });
                    on(document.getElementById('setPrivacy'), 'change', function (event) {
                        var node = event.target;
                        var value = node[node.selectedIndex].value;
                        messageProxy.set('privacyStatus', value);
                    });
                    on(document.getElementById('toggleAction'), 'click', function (event) {
                        messageProxy.set('forwarded', !messageProxy.get('forwarded'));
                        messageProxy.set('replied', !messageProxy.get('replied'));
                    });
                    on(document.getElementById('toggleComments'), 'click', function (event) {
                        var hasComments = Boolean(messageProxy.get('commentCount'));
                        var count = hasComments ? 0 : 1;
                        messageProxy.set('commentCount', count);
                    });
                    on(document.getElementById('setSubject'), 'click', function (event) {
                        var input = (event.target.previousElementSibling);
                        messageProxy.set('subject', input.value);
                    });
                });
            });
        });
    });
    return app;
});
//# sourceMappingURL=MessageRow.js.map