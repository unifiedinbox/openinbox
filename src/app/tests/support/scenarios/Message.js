define(["require", "exports", 'app/models/Message'], function (require, exports, Message) {
    var allProperties = [
        'attachments',
        'avatar',
        'bcc',
        'body',
        'cc',
        'commentCount',
        'connectionType',
        'date',
        'folderId',
        'format',
        'forwarded',
        'from',
        'hasAttachment',
        'id',
        'isJunk',
        'isRead',
        'isStarred',
        'labels',
        'messageType',
        'participants',
        'priority',
        'privacyStatus',
        'readReceipt',
        'replied',
        'replyTo',
        'subject',
        'to',
        'isSelected'
    ];
    var scenarios = {
        listView: allProperties
    };
    Message.prototype._scenarios = scenarios;
    return scenarios;
});
//# sourceMappingURL=Message.js.map