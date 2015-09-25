define(["require", "exports", 'app/endpoints', 'dojo/request/registry', './util', "./data/getAllMessages"], function (require, exports, endpoints, registry, util) {
    var messageData = require('./data/getAllMessages');
    registry.register(endpoints.getAllMessages, function (url, options) {
        var endIndex = Math.min(options.data.startrecord + options.data.limit, messageData.length);
        var data = options.data;
        var filters = data.ViewStandardFilters;
        var filtered = !filters ? messageData : messageData.filter(function (object) {
            return (filters[0] === 'mymessages') ? (object.assigned_to === '4968') : (object.status === 'false');
        });
        if (data.searchPattern) {
            filtered = filtered.filter(function (object) {
                return object.from.toLowerCase().indexOf(data.searchPattern.toLowerCase()) > -1;
            });
        }
        if (data.sortColumn) {
            var column = data.sortColumn;
            var order = data.sortOrder;
            filtered = filtered.sort(function (left, right) {
                var leftValue = (column === 'date') ? new Date(left[column]) : left[column];
                var rightValue = (column === 'date') ? new Date(right[column]) : right[column];
                if (leftValue === rightValue) {
                    return 0;
                }
                if (order === 'DESC') {
                    return leftValue < rightValue ? 1 : -1;
                }
                else {
                    return leftValue < rightValue ? -1 : 1;
                }
            });
        }
        if (typeof data.folderid === 'number') {
            filtered = filtered.filter(function (item) {
                return item.categoryIndx === String(data.folderid);
            });
        }
        return util.delay({
            response: [
                {
                    data: [
                        0,
                        filtered.slice(data.startrecord, endIndex),
                        filtered.length
                    ]
                }
            ]
        });
    });
    registry.register(endpoints.getMessageCounts, function (url, options) {
        return util.delay({
            response: [{
                data: {
                    total_message_count: '1574',
                    unread_message_count: '1533',
                    my_message_count: '89',
                    new_message_count: '53'
                }
            }]
        });
    });
});
//# sourceMappingURL=getAllMessages.js.map