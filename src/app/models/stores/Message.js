define(["require", "exports", 'mayhem/Promise', 'dojo/_base/declare', 'dojo/_base/lang', 'dojo/request', 'dstore/Memory', 'dstore/Store', 'dstore/Trackable', '../Attachment', './Attachment', '../../endpoints', './HeaderMixin', '../Message', "dstore/QueryResults"], function (require, exports, Promise, declare, lang, request, Memory, Store, Trackable, Attachment, AttachmentStore, endpoints, HeaderMixin, MessageModel) {
    AttachmentStore;
    var QueryResults = require('dstore/QueryResults');
    var standardFiltersMap = {
        myMessages: 'mymessages',
        newMessages: 'new_mails_comments'
    };
    var searchInMap = {
        messages: 1,
        people: 3,
        attachments: 4,
        comments: 5,
        tags: 6,
        subject: 7,
        from: 8,
        to: 9
    };
    var MessageStore = declare([Store, HeaderMixin, Trackable], {
        headers: null,
        target: '',
        accepts: 'application/json',
        constructor: function (kwArgs) {
            this._filter = {};
        },
        add: function (item) {
            return Promise.resolve(item);
        },
        put: function (item) {
            return Promise.resolve(item);
        },
        filter: function (query) {
            var subcollection = this.inherited(arguments);
            if (query && 'folderId' in query) {
                subcollection._folderId = query.folderId;
            }
            return subcollection;
        },
        search: function (search, type) {
            if (type === void 0) { type = 'people'; }
            var filterArgs;
            if (type === 'standardFilter') {
                filterArgs = { ViewStandardFilters: [standardFiltersMap[search]] };
            }
            else if (type === 'all') {
                filterArgs = { customSearch: true, searchPattern: search };
            }
            else {
                filterArgs = {
                    'searchInFolder[]': 1,
                    'searchIn[]': (searchInMap[type] || searchInMap.people),
                    searchPattern: search
                };
            }
            return this.filter(filterArgs);
        },
        fetch: function () {
            return this.fetchRange({ start: 0, end: 100 });
        },
        fetchRange: function (kwArgs) {
            var args = this._applyFilters({
                startrecord: kwArgs.start,
                limit: kwArgs.end - kwArgs.start
            });
            var response = request.post(endpoints.getAllMessages, this._configureRequestOptions(args));
            var results = this._getAllMessagesResponseHandler(response);
            return new QueryResults(results.data, {
                totalLength: results.total,
                response: results.response
            });
        },
        getMessageCounts: function () {
            return this._actionRequest(endpoints.getMessageCounts).then(function (data) {
                var pattern = /(_[a-z])/g;
                return Object.keys(data).reduce(function (mapped, key) {
                    var camelCaseKey = key.replace(pattern, function (matched) {
                        return matched.toUpperCase().replace('_', '');
                    });
                    mapped[camelCaseKey] = Number(data[key]);
                    return mapped;
                }, {});
            });
        },
        archive: function (id) {
            return this._actionRequest(endpoints.archiveMessage, {
                msgindx: id,
                folderIndex: this._folderId
            });
        },
        moveToFolder: function (kwArgs) {
            var args = {
                chkmsgindx: kwArgs.messageIds.join(','),
                targetFolder: kwArgs.targetFolder
            };
            return this._actionRequest(endpoints.moveToFolder, args);
        },
        markAs: function (kwArgs) {
            var args = {
                msgIndx: JSON.stringify(kwArgs.messageIds),
                currentFolder: this._folderId
            };
            var url;
            switch (kwArgs.status) {
                case 0 /* Read */:
                    url = endpoints.markAsRead;
                    break;
                case 1 /* Unread */:
                    url = endpoints.markAsUnread;
                    break;
                case 2 /* Junk */:
                    url = endpoints.markAsJunk;
                    break;
                case 3 /* NotJunk */:
                    url = endpoints.markAsNotJunk;
                    break;
                case 4 /* Starred */:
                    args.starStatus = 'Y';
                    url = endpoints.markAsStarred;
                    break;
                case 5 /* Unstarred */:
                    args.starStatus = 'N';
                    url = endpoints.markAsStarred;
                    break;
            }
            return this._actionRequest(url, args);
        },
        blacklistSender: function (kwArgs) {
            return this._actionRequest(endpoints.blacklistSender, {
                msgIndx: JSON.stringify(kwArgs.messageIds),
                currentFolder: this._folderId
            });
        },
        whitelistSender: function (kwArgs) {
            return this._actionRequest(endpoints.whitelistSender, {
                msgIndx: JSON.stringify(kwArgs.messageIds),
                currentFolder: this._folderId
            });
        },
        forward: function (message, withHeader) {
            var _this = this;
            if (withHeader === void 0) { withHeader = false; }
            return this._createSendArgs(message).then(function (args) {
                args.mForwardmsgIndx = String(message.get('sourceId'));
                args.withHeader = withHeader ? 'true' : 'false';
                return _this._actionRequest(endpoints.forwardMessage, args);
            });
        },
        delete: function (kwArgs) {
            return this._actionRequest(endpoints.deleteMessage, {
                chkmsgindx: JSON.stringify(kwArgs.messageIds),
                lbfolders: this._folderId
            });
        },
        reply: function (message) {
            var _this = this;
            return this._createSendArgs(message).then(function (args) {
                args.mReplyTomsgIndx = String(message.get('sourceId'));
                return _this._actionRequest(endpoints.replyMessage, args);
            });
        },
        send: function (message) {
            var _this = this;
            return this._createSendArgs(message).then(function (args) {
                return _this._actionRequest(endpoints.sendMessage, args);
            });
        },
        saveAsDraft: function (message, action) {
            var _this = this;
            return this._createSendArgs(message).then(function (args) {
                var distributeField;
                if (action) {
                    distributeField = (action === 'forward') ? 'mForwardmsgIndx' : 'mReplyTomsgIndx';
                    args[distributeField] = String(message.get('sourceId'));
                }
                return _this._actionRequest(endpoints.saveAsDraft, args);
            });
        },
        _restore: function (object) {
            var id = object.msg_index;
            var hasAttachment = object.attachment !== '0';
            var restored = new MessageModel({
                attachments: hasAttachment ? Attachment.store.filter({ messageId: id }) : new Memory(),
                avatar: object.sender_avatarLink,
                bcc: object.msg_bcc && object.msg_bcc.split(',') || [],
                cc: object.msg_cc && object.msg_cc.split(',') || [],
                commentCount: Number(object.commentCount),
                connectionType: object.accType,
                date: new Date(object.vchdate),
                folderId: object.categoryIndx,
                forwarded: object.forwarded === 'y',
                from: object.from,
                hasAttachment: hasAttachment,
                id: id,
                isJunk: object.safe !== 'Safe',
                isRead: object.status === 'true',
                isStarred: object.star_status === 'Y',
                labels: object.labels.data,
                messageType: object.mMessageType,
                priority: Number(object.priority),
                privacyStatus: object.privacyStatus,
                replied: object.replied === 'y',
                subject: object.subject,
                to: object.to && object.to.split(',') || []
            });
            return restored;
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
                data: !kwArgs ? kwArgs : Object.keys(kwArgs).reduce(function (data, key) {
                    if (key === 'folderId') {
                        data.folderid = kwArgs.folderId;
                    }
                    else {
                        data[key] = kwArgs[key];
                    }
                    return data;
                }, {})
            };
        },
        _actionRequest: function (apiMethod, kwArgs, responseHandler) {
            var promise = request.post(apiMethod, this._configureRequestOptions(kwArgs));
            var requestResults = responseHandler ? responseHandler(promise) : this._defaultResponseHandler(promise);
            return lang.delegate(requestResults.data, { response: requestResults.response });
        },
        _applyFilters: function (kwArgs) {
            var slice = Array.prototype.slice;
            function checkFilter(arg) {
                if (arg.type === 'eq') {
                    kwArgs[arg.args[0]] = arg.args[1];
                }
                else if (arg.type === 'and') {
                    slice.call(arg.args).forEach(checkFilter);
                }
            }
            this.queryLog.forEach(function (entry) {
                if (entry.type === 'filter') {
                    entry.normalizedArguments.forEach(checkFilter);
                }
            });
            return kwArgs;
        },
        _getAllMessagesResponseHandler: function (response) {
            var self = this;
            return {
                data: response.then(function (response) {
                    var results = response.response[0].data[1];
                    for (var i = 0; i < results.length; i++) {
                        results[i] = self._restore(results[i], true);
                    }
                    return results;
                }),
                total: response.then(function (response) {
                    return response.response[0].data[2];
                }),
                response: response.response
            };
        },
        _defaultResponseHandler: function (response) {
            return {
                data: response.then(function (response) {
                    var result = response.response;
                    if (result[0] && result[0].data) {
                        result = result[0].data;
                    }
                    return result;
                }),
                response: response.response
            };
        },
        _createSendArgs: function (message) {
            var attachments = message.get('attachments');
            var sendArgs = {
                fromEmail: message.get('from'),
                to: message.get('to').join(','),
                cc: message.get('cc').join(','),
                bcc: message.get('bcc').join(','),
                subject: message.get('subject'),
                content: message.get('body'),
                comboPriority: String(message.get('priority')),
                readconfirm: message.get('readReceipt') ? 'true' : 'false',
                replyTo: message.get('replyTo'),
                messageformat: String(message.get('format'))
            };
            if (!attachments) {
                return Promise.resolve(sendArgs);
            }
            return attachments.fetch().then(function (attachments) {
                return sendArgs;
            });
        }
    });
    MessageModel.setDefaultStore(new MessageStore({ app: 'app/main' }));
    return MessageStore;
});
//# sourceMappingURL=Message.js.map