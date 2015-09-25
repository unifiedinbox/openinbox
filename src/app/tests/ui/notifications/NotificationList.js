define(["require", "exports", '../app', 'app/models/Comment', 'app/models/Contact', 'app/models/Notification', 'mayhem/Promise', 'app/auth/Session', 'mayhem/auth/User', '../../mocks/all', 'app/models/stores/Contact', "mayhem/templating/html!app/tests/ui/notifications/ListTemplate.html"], function (require, exports, app, Comment, Contact, Notification, Promise, Session, User, mocks, ContactStore) {
    mocks;
    ContactStore;
    var AppView;
    AppView = require('mayhem/templating/html!app/tests/ui/notifications/ListTemplate.html');
    Comment.setDefaultApp(app);
    Contact.setDefaultApp(app);
    Notification.setDefaultApp(app);
    app.run().then(function () {
        var unreadCount = 0;
        var message = 'Bacon ipsum dolor amet porchetta cow capicola pork belly \
	beef ribs short ribs ribeye shoulder swine tail. Strip steak cupim drumstick, \
	salami rump t-bone biltong jowl pork loin andouille porchetta fatback. Porchetta \
	picanha tenderloin bacon. Picanha sausage spare ribs meatloaf, sirloin pastrami \
	turducken hamburger. Alcatra drumstick short loin turkey andouille spare ribs \
	kevin pastrami sirloin tongue turducken.';
        var promises = [];
        Contact.store.app = app;
        [
            'Ken Franqueiro',
            'James Donaghue',
            'Matt Wistrand',
            'Nita Tune',
            'Torrey Rice'
        ].forEach(function (name, index) {
            var nameParts = name.split(' ');
            Contact.store.put(new Contact({
                id: index,
                firstName: nameParts[0],
                lastName: nameParts[1],
                email: (nameParts[0].charAt(0) + nameParts[1]).toLowerCase() + '@sitepen.com',
                image: (nameParts[0].charAt(0) + nameParts[1].charAt(0))
            }));
        });
        while (unreadCount < 10) {
            promises.push(Contact.get(Math.floor(unreadCount / 2)).then(function (contact) {
                return Notification.store.put(new Notification({
                    id: unreadCount,
                    type: 'mention',
                    item: new Comment({
                        contact: contact,
                        message: message
                    })
                }));
            }));
            unreadCount += 1;
        }
        Promise.all(promises).then(function () {
            app.set('user', new User({
                mentions: Notification.store.filter({ type: 'mention' }),
                session: new Session({ userId: 12345 })
            }));
            var appView = new AppView({ app: app });
            appView.on('notification-selected', function (event) {
                var comment = event.target.get('model').get('item');
                console.log('notification-selected event triggered for comment by ' + comment.get('contact').get('displayName'));
            });
            app.get('ui').set('view', appView);
        });
    });
    return app;
});
//# sourceMappingURL=NotificationList.js.map