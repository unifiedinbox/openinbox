define(["require", "exports", '../Conversation', 'dojo/_base/declare', '../../endpoints', './HeaderMixin', 'dojo/_base/lang', 'dojo/request', 'dstore/Store', 'dstore/Trackable', "dstore/QueryResults"], function (require, exports, Conversation, declare, endpoints, HeaderMixin, lang, request, Store, Trackable) {
    var QueryResults = require('dstore/QueryResults');
    ;
    ;
    var ConversationStore = declare([Store, Trackable, HeaderMixin], {
        Model: Conversation,
        _restore: function (object) {
            return new Conversation({
                bcc: object.bcc,
                body: object.body,
                cc: object.cc,
                date: new Date(object.dtDate.replace(' ', 'T') + 'Z'),
                forwarded: object.forwarded !== 'n',
                fromEmail: object.email_from,
                fromName: object.from,
                id: object.vchMessageID,
                messageId: Number(object.msg_index),
                replied: object.replied !== 'n',
                subject: object.showsubject,
                to: object.to
            });
        },
        filter: function (query) {
            var subcollection = this.inherited(arguments);
            if (query && 'messageId' in query) {
                subcollection._messageId = query.messageId;
            }
            return subcollection;
        },
        fetch: function () {
            var results = this._fetchConversation();
            return new QueryResults(results.data, {
                totalLength: results.total,
                response: results.response
            });
        },
        fetchRange: function (kwArgs) {
            var results = this._fetchConversation();
            return new QueryResults(results.data.slice ? results.data.slice(kwArgs.start, kwArgs.end) : results.data, {
                totalLength: results.total,
                response: results.response
            });
        },
        _fetchConversation: function () {
            var args = {};
            this.queryLog.forEach(function (entry) {
                if (entry.type === 'filter') {
                    entry.normalizedArguments.forEach(function (arg) {
                        if (arg.type === 'eq') {
                            args[arg.args[0]] = arg.args[1];
                        }
                    });
                }
            });
            var response = request.post(endpoints.showConversation, this._configureRequestOptions(args));
            return this._showConversationResponseHandler(response);
        },
        _configureRequestOptions: function (kwArgs) {
            var headers = this._getAppHeaders();
            if (!headers) {
                throw new Error('Session headers have not been set; please ensure User login has completed successfully.');
            }
            headers = lang.delegate(headers, { Accept: this.accepts });
            return {
                handleAs: 'json',
                headers: headers,
                data: {
                    msgIndx: kwArgs.messageId
                }
            };
        },
        _showConversationResponseHandler: function (showConversationResponse) {
            var _this = this;
            return {
                data: showConversationResponse.then(function (response) {
                    return response.response[0].data.map(function (result) {
                        return this._restore(result);
                    }, _this);
                }),
                total: showConversationResponse.then(function (response) {
                    return response.response[0].data ? response.response[0].data.length : 0;
                }),
                response: showConversationResponse.response
            };
        }
    });
    Conversation.setDefaultStore(new ConversationStore({ app: 'app/main' }));
    return ConversationStore;
});
//# sourceMappingURL=Conversation.js.map