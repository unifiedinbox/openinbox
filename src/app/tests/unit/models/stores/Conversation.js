define(["require", "exports", 'intern/chai!assert', 'app/models/Conversation', 'app/models/stores/Conversation', '../../../mocks/showConversation', '../../../mocks/data/showConversation', 'mayhem/Promise', 'intern!object', 'mayhem/WebApplication'], function (require, exports, assert, Conversation, ConversationStore, conversationMock, mockData, Promise, registerSuite, WebApplication) {
    ConversationStore;
    conversationMock;
    var app;
    function createApp() {
        app = new WebApplication({
            apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT',
            name: 'Test',
            components: {
                i18n: { preload: ['app/nls/main'] },
                router: null,
                ui: { view: null },
                user: {
                    constructor: 'app/auth/User'
                }
            }
        });
        return app.run().then(function () {
            return app.get('user').login({ username: 'test', password: 'test' }).then(function () {
                Conversation.setDefaultApp(app);
                Conversation.setDefaultStore(new ConversationStore({ app: app }));
            });
        });
    }
    function assertYN(booleanValue, yn, message) {
        var expected = booleanValue ? 'y' : 'n';
        assert.strictEqual(yn, expected, message);
    }
    registerSuite({
        name: 'app/models/stores/Conversation',
        beforeEach: function () {
            return createApp();
        },
        afterEach: function () {
            app.destroy();
        },
        'filter': function () {
            var messageId = 10;
            var results = Conversation.store.filter({ messageId: messageId }).fetch();
            return Promise.all([
                results.then(function (results) {
                    assert.isDefined(results, 'Results should be defined');
                    assert.strictEqual(results.length, mockData.length, 'Total length of results should be 2');
                    results.forEach(function (result, i) {
                        var mock = mockData[i];
                        assert.sameMembers(result.get('bcc'), mock.bcc, 'Result\'s bcc should match mock data');
                        assert.strictEqual(result.get('body'), mock.body, 'Result\'s body should match mock data');
                        assert.sameMembers(result.get('cc'), mock.cc, 'Result\'s cc should match mock data');
                        assertYN(result.get('forwarded'), mock.forwarded, 'Result\'s forwarded should match mock data');
                        assert.strictEqual(result.get('fromEmail'), mock.email_from, 'Result\'s fromEmail should match mock\'s email_from');
                        assert.strictEqual(result.get('fromName'), mock.from, 'Result\'s fromName should match mock\'s from');
                        assert.strictEqual(result.get('id'), mock.vchMessageID, 'Result\'s id should match mock data\'s vchMessageID');
                        assert.strictEqual(result.get('messageId'), messageId, 'Result\'s messageId should match the messageId that was used as a filter');
                        assertYN(result.get('replied'), mock.replied, 'Result\'s replied should match mock data');
                        assert.strictEqual(result.get('subject'), mock.showsubject, 'Result\'s subject should match mock\'s showsubject');
                        assert.sameMembers(result.get('to'), mock.to, 'Result\'s to should match mock data');
                    });
                }),
                results.totalLength.then(function (total) {
                    assert.strictEqual(total, mockData.length, 'Reported totalLength should be 2');
                })
            ]);
        }
    });
});
//# sourceMappingURL=Conversation.js.map