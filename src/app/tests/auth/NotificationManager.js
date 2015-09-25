define(["require", "exports", 'dojo/request', '../ui/app', 'app/endpoints', 'app/models/Message', 'app/models/Notification', 'app/auth/NotificationManager'], function (require, exports, request, app, endpoints, Message, Notification, NotificationManager) {
    Message.setDefaultApp(app);
    Notification.setDefaultApp(app);
    app.run().then(function () {
        request.post('http://apis.unifiedinbox.com/v1/System/Auth/login', {
            handleAs: 'json',
            data: {
                username: 'testeramt123@gmail.com',
                password: 'tester123',
                service: 'uib'
            },
            headers: {
                'apikey': 'GqSAo0rrvurPc1gAr6dfwK6HOHKNLvX3',
                'X-Requested-With': ''
            }
        }).then(function (data) {
            var userData = data.response[0].data;
            var manager = new NotificationManager({
                app: app,
                startOnInitialize: false,
                connectionData: {
                    jid: userData.account_email,
                    session: userData.session
                }
            });
            document.getElementById('waiting').classList.add('is-hidden');
            document.getElementById('testActions').classList.remove('is-hidden');
            var countSpan = document.getElementById('newMessageCount');
            var count = Number(countSpan.firstChild.nodeValue);
            document.getElementById('addMessage').addEventListener('click', function () {
                manager.add({
                    id: 12345,
                    type: 'message',
                    isRead: false,
                    item: new Message({ id: 23456 })
                }).then(function () {
                    countSpan.firstChild.nodeValue = String(++count);
                });
            });
            document.getElementById('getNotifications').addEventListener('click', function () {
                console.log('contacting ' + endpoints.notifications + '...');
                request.post(endpoints.notifications, {
                    handleAs: 'json',
                    headers: {
                        apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT',
                        app: userData.app,
                        sessionId: userData.session
                    }
                }).then(function (data) {
                    console.log(data);
                });
            });
        });
    });
    return app;
});
//# sourceMappingURL=NotificationManager.js.map