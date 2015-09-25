define(["require", "exports", '../Attachment', 'dstore/Cache', 'dojo/_base/declare', '../../endpoints', './HeaderMixin', 'dojo/_base/lang', 'dojo/request', 'dstore/Store', 'dstore/Trackable', './TrackableMemory', "dstore/QueryResults"], function (require, exports, Attachment, Cache, declare, endpoints, HeaderMixin, lang, request, Store, Trackable, TrackableMemory) {
    var QueryResults = require('dstore/QueryResults');
    ;
    ;
    var AttachmentStore = declare([Store, Trackable, HeaderMixin], {
        Model: Attachment,
        _restore: function (attachment) {
            return new Attachment({
                name: attachment.name,
                type: attachment.type,
                size: attachment.size
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
            var results = this._fetchAttachments();
            return new QueryResults(results.data, {
                totalLength: results.total,
                response: results.response
            });
        },
        fetchRange: function (kwArgs) {
            var results = this._fetchAttachments();
            return new QueryResults(results.data.slice(kwArgs.start, kwArgs.end), {
                totalLength: results.total,
                response: results.response
            });
        },
        _fetchAttachments: function () {
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
            var response = request.post(endpoints.getAttachments, this._configureRequestOptions(args));
            return this._getAttachmentsResponseHandler(response);
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
        _getAttachmentsResponseHandler: function (getAttachmentsResponse) {
            var _this = this;
            return {
                data: getAttachmentsResponse.then(function (response) {
                    var data = response.response[0].data;
                    var attachments = data && data.data;
                    return (!attachments) ? [] : attachments.map(function (result) {
                        return this._restore(result);
                    }, _this);
                }),
                total: getAttachmentsResponse.then(function (response) {
                    var data = response.response[0].data;
                    return data && data.data ? data.data.length : 0;
                }),
                response: getAttachmentsResponse.response
            };
        }
    });
    Attachment.setDefaultStore(Cache.create(new AttachmentStore({ app: 'app/main' }), {
        cachingStore: new TrackableMemory({ app: 'app/main' })
    }));
    return AttachmentStore;
});
//# sourceMappingURL=Attachment.js.map