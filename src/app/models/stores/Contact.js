define(["require", "exports", '../Contact', 'dojo/_base/declare', '../../endpoints', './HeaderMixin', 'dojo/request', './RequestMemory', 'dstore/Trackable'], function (require, exports, Contact, declare, endpoints, HeaderMixin, request, RequestMemory, Trackable) {
    ;
    var ContactStore = declare([RequestMemory, Trackable, HeaderMixin], {
        Model: Contact,
        _request: function () {
            var _this = this;
            var getContactListRequest = request.post(endpoints.getContactsList, {
                headers: this._getAppHeaders(),
                handleAs: 'json'
            });
            return {
                data: getContactListRequest.then(function (response) {
                    return response.response[0].data.map(function (result) {
                        return _this._restore(result);
                    });
                }),
                total: getContactListRequest.then(function (response) {
                    return response.response[0].data.length;
                }),
                response: getContactListRequest.response
            };
        },
        _restore: function (contact) {
            return new Contact({
                accounts: contact.accounts,
                displayName: contact.name,
                id: contact.intIndx,
                image: contact.imagepath
            });
        }
    });
    Contact.setDefaultStore(new ContactStore({ app: 'app/main' }));
    return ContactStore;
});
//# sourceMappingURL=Contact.js.map