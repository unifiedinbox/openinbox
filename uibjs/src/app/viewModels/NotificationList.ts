import Comment = require('../models/Comment');
import Proxy = require('mayhem/data/Proxy');
import Notification = require('../models/Notification');
import mayhemUtil = require('mayhem/util');
import util = require('../util');

class NotificationViewModel extends Proxy<Notification> {
	get:NotificationViewModel.Getters;
	set:NotificationViewModel.Setters;

	// User-friendly accessor for Notification#item.
	_commentGetter():Comment {
		return <any> this.get('item');
	}

	_markAsTextDependencies():string[] {
		return [ 'isRead' ];
	}
	_markAsTextGetter():string {
		var messages = (<any> this.get('app').get('i18n')).get('messages');
		var text:string = messages.toggleReadStatus({ ISREAD: this.get('isRead') });

		return mayhemUtil.escapeXml(text);
	}

	// TODO: This functionality is also in app/viewModels/MessageList.
	_smartDateGetter():string {
		var messages = (<any> this.get('app').get('i18n')).get('messages');
		var date:Date = <any> this.get('item').get('date');

		return util.formatSmartTime(date, messages);
	}

	_stateClassDependencies():string[] {
		return [ 'isRead' ];
	}

	_stateClassGetter():string {
		return this.get('isRead') ? 'is-read' : 'is-unread';
	}

	_subjectGetter():string {
		var messages = (<any> this.get('app').get('i18n')).get('messages');
		return messages.commentMention({ NAME: (<any> this.get('item')).get('contact').get('displayName') });
	}
}

module NotificationViewModel {
	export interface Getters extends Notification.Getters, Proxy.Getters {
		(key:'markAsText'):string;
		(key:'smartDate'):string;
		(key:'stateClass'):string;
		(key:'subject'):string;
	};

	export interface Setters extends Notification.Setters, Proxy.Setters {};
}

export = NotificationViewModel;
