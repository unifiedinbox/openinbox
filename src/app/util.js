define(["require", "exports", 'mayhem/Promise', 'mayhem/data/Proxy'], function (require, exports, Promise, Proxy) {
    function contains(parent, widget) {
        var candidate = widget;
        do {
            if (candidate === parent) {
                return true;
            }
        } while (candidate = candidate.get('parent'));
        return false;
    }
    exports.contains = contains;
    function getProxyTarget(object) {
        var target = object;
        while (target instanceof Proxy) {
            target = target.get('target');
        }
        return target;
    }
    exports.getProxyTarget = getProxyTarget;
    function positionNode(node, anchorNode) {
        var position = anchorNode.getBoundingClientRect();
        node.style.left = String(position.left) + 'px';
        node.style.top = String(position.bottom) + 'px';
        var popupPosition = node.getBoundingClientRect();
        if (popupPosition.right > document.documentElement.clientWidth) {
            node.style.left = String(position.right - node.offsetWidth) + 'px';
        }
        if (popupPosition.bottom > document.documentElement.clientHeight) {
            node.style.top = String(position.top - node.offsetHeight) + 'px';
        }
    }
    exports.positionNode = positionNode;
    function toCamelCase(value) {
        return value.toLowerCase().replace(/([\-\s]+[a-z])/g, function (matched) {
            return matched.toUpperCase().replace(/[\-\s]/, '');
        });
    }
    exports.toCamelCase = toCamelCase;
    function formatListPlusRemainder(list, displayCount, separator) {
        if (displayCount === void 0) { displayCount = 2; }
        if (separator === void 0) { separator = ', '; }
        var formattedList = list.slice(0, displayCount).join(separator);
        if (list.length > displayCount) {
            formattedList += ' +' + (list.length - displayCount);
        }
        return formattedList;
    }
    exports.formatListPlusRemainder = formatListPlusRemainder;
    function formatSmartTime(dateTime, i18nMessages) {
        if (!dateTime || String(dateTime) === 'Invalid Date') {
            return '';
        }
        var date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
        var current = Date.now();
        var difference = Math.round((current - Number(dateTime)) / 1000);
        var formattedTime;
        if (difference < 3600) {
            formattedTime = String(Math.round(difference / 60)) + i18nMessages.minuteUnit();
        }
        else if (difference < 86400) {
            formattedTime = String(Math.round(difference / 3600)) + i18nMessages.hourUnit();
        }
        else if (difference < (7 * 86400)) {
            formattedTime = String(Math.round(difference / 86400)) + i18nMessages.dayUnit();
        }
        else {
            formattedTime = date.toLocaleDateString();
        }
        return formattedTime;
    }
    exports.formatSmartTime = formatSmartTime;
    function removeAll(store) {
        return store.fetch().then(function (results) {
            var promises = [];
            for (var i = results.length; i--;) {
                promises.push(store.remove(store.getIdentity(results[i])));
            }
            return Promise.all(promises);
        });
    }
    exports.removeAll = removeAll;
});
//# sourceMappingURL=util.js.map