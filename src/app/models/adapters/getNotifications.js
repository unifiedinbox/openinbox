define(["require", "exports", 'mayhem/Promise', '../Contact', '../Comment', '../Message'], function (require, exports, Promise, Contact, Comment, Message) {
    exports.MessageTypes = {
        a: 'email',
        c: 'draft',
        d: 'send after approval',
        e: 'twilio',
        i: 'UnifiedInbox information mails',
        j: 'read receipt mails',
        k: 'memo',
        l: 'declined mails',
        m: 'send later mails',
        n: 'UnifiedInbox welcome mail',
        o: 'UnifiedInbox release mail',
        p: 'Twitter email type(is_following only)',
        q: 'facebook messages',
        r: 'twitter messages',
        s: 'bascecamp messages',
        t: 'twitter mentions',
        u: 'facebook posts',
        v: 'evernote',
        db: 'dropbox',
        dq: 'discuss messages',
        sk: 'skype messages',
        w: 'memo to email/gmail',
        x: 'facebook @mentioned wall post',
        y: 'linkedIn message/user wall post',
        z: 'linkedIn page post',
        lgp: 'linkedIn group post',
        sms: 'sms',
        ss: 'shango service',
        bc: 'broadcast'
    };
    exports.ConnectionTypeMap = {
        a: 'email',
        c: 'email',
        i: 'email',
        k: 'email',
        n: 'email',
        o: 'email',
        p: 'twitter',
        q: 'facebook',
        r: 'twitter',
        t: 'twitter',
        u: 'facebook',
        w: 'email',
        x: 'facebook',
        y: 'linkedin',
        z: 'linkedin',
        lgp: 'linkedin'
    };
    function message(item) {
        var data = item.data;
        var connectionType = exports.ConnectionTypeMap[data.msgtype];
        return Promise.resolve(new Message({
            body: data.content,
            connectionType: connectionType,
            contactId: data.userindx,
            date: new Date(data.postdate),
            folderId: data.folderIndex,
            id: data.msgindx,
            subject: data.fullsubject
        }));
    }
    exports.message = message;
    function mention(item) {
        var data = item.data;
        return Contact.get(data.userindx).then(function (contact) {
            return new Comment({
                contact: contact,
                date: new Date(data.postdate),
                id: data.noteIndx,
                message: data.content
            });
        });
    }
    exports.mention = mention;
});
//# sourceMappingURL=getNotifications.js.map