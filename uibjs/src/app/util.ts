import Promise = require('mayhem/Promise');
import Proxy = require('mayhem/data/Proxy');
import Widget = require('mayhem/ui/dom/Widget');

export function contains(parent:Widget, widget:Widget):boolean {
	var candidate:Widget = widget;

	do {
		if (candidate === parent) {
			return true;
		}
	} while (candidate = candidate.get('parent'));

	return false;
}

export function getProxyTarget(object:any):any {
	var target = object;

	while (target instanceof Proxy) {
		target = target.get('target');
	}

	return target;
}

export function positionNode(node:HTMLElement, anchorNode:HTMLElement) {
	var position = anchorNode.getBoundingClientRect();

	node.style.left = String(position.left) + 'px';
	node.style.top = String(position.bottom) + 'px';
	var popupPosition = node.getBoundingClientRect();

	// If popup won't fit left/bottom-aligned, switch it as necessary
	if (popupPosition.right > document.documentElement.clientWidth) {
		node.style.left = String(position.right - node.offsetWidth) + 'px';
	}
	if (popupPosition.bottom > document.documentElement.clientHeight) {
		node.style.top = String(position.top - node.offsetHeight) + 'px';
	}
}

export function toCamelCase(value:string):string {
	return value.toLowerCase().replace(/([\-\s]+[a-z])/g, function (matched:string) {
		return matched.toUpperCase().replace(/[\-\s]/, '');
	});
}

export function formatListPlusRemainder(list:string[], displayCount:number = 2, separator:string = ', ') {
	var formattedList = list.slice(0, displayCount).join(separator);

	if (list.length > displayCount) {
		formattedList += ' +' + (list.length - displayCount);
	}

	return formattedList;
}

export function formatSmartTime(dateTime:Date, i18nMessages:any):string {
	if (!dateTime || String(dateTime) === 'Invalid Date') {
		return '';
	}

	var date = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
	var current:number = Date.now();
	var difference:number = Math.round((current - Number(dateTime)) / 1000);
	var formattedTime:string;

	if (difference < 3600) {
		formattedTime = String(Math.round(difference / 60)) + i18nMessages.minuteUnit();
	}
	else if (difference < 86400) {
		formattedTime = String(Math.round(difference / 3600 )) + i18nMessages.hourUnit();
	}
	else if (difference < (7 * 86400)) {
		formattedTime = String(Math.round(difference / 86400 )) + i18nMessages.dayUnit();
	}
	else {
		formattedTime = date.toLocaleDateString();
	}

	return formattedTime;
}

export function removeAll(store:dstore.ICollection<any>):IPromise<any> {
	return store.fetch().then(function (results) {
		var promises:Promise<any>[] = [];
		for (var i = results.length; i--;) {
			promises.push(store.remove(store.getIdentity(results[i])));
		}
		return Promise.all(promises);
	});
}
