// NOTES: Since at least some of these methods need to return promises,
// all of them should probably return promises.

import Promise = require('mayhem/Promise');
import Contact = require('../Contact');
import Comment = require('../Comment');
import Message = require('../Message');

// TODO: This is not currently used for anything, and the values need to be converted into
// something more useful.
export var MessageTypes = {
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

export var ConnectionTypeMap = {
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

export function message(item:IMessageNotification):IPromise<Message> {
	var data = item.data;
	var connectionType = (<any> ConnectionTypeMap)[data.msgtype];

	return Promise.resolve(new Message({
		body: data.content,
		connectionType: connectionType,
		// TODO: We pass in the entire contact object to the Comment model, should
		// we not do the same thing here in order to prevent needing promises in the views?
		contactId: data.userindx,
		// TODO: Confirm that the timezone of postdate.
		date: new Date(data.postdate),
		folderId: data.folderIndex,
		id: data.msgindx,
		subject: data.fullsubject
	}));
}

export function mention(item:IMentionNotification):IPromise<Comment> {
	var data = item.data;

	return Contact.get(data.userindx).then(function (contact:Contact):Comment {
		return new Comment({
			contact: contact,
			// TODO: Confirm that the timezone of postdate.
			date: new Date(data.postdate),
			id: data.noteIndx,
			// TODO: would this be better as a Message object?
			message: data.content
		});
	});
}

export interface IMentionNotification {
	id:number;
	s:number;
	data:{
		content:string;
		dateWithTimeZone:string;
		fullsubject:number;
		msg:string;
		msgindx:number;
		noteIndx:number;
		postdate:string;
		subject:string;
		username:string;
		userindx:number;
	};
}

export interface IMessageNotification {
	id:number;
	s:number;
	data:{
		content:string;
		dateWithTimeZone:string;
		folderIndex:number;
		fullsubject:string;
		// `msg` is the application message (e.g., "new message from {contact}"), not the message body.
		msg:string;
		msg_from:string;
		msgindx:number;
		msgtype:string;
		postdate:string;
		subject:string;
		userindx:number;
		username:string;
	};
}
