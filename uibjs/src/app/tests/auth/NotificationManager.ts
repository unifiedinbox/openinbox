import request = require('dojo/request');
import app = require('../ui/app');
import endpoints = require('app/endpoints');
import Message = require('app/models/Message');
import Notification = require('app/models/Notification');
import NotificationManager = require('app/auth/NotificationManager');

Message.setDefaultApp(app);
// Notification isn't actually used, but it's here in order to guard against undefinedModule errors.
Notification.setDefaultApp(app);

app.run().then(function () {
	request.post('http://apis.unifiedinbox.com/v1/System/Auth/login', {
		handleAs: 'json',
		data: {
			username: 'testeramt123@gmail.com',
			password: 'tester123',
			service: 'uib'
		},
		headers: {
			'apikey': 'GqSAo0rrvurPc1gAr6dfwK6HOHKNLvX3',
			'X-Requested-With': ''
		}
	}).then(function(data:HashMap<any>):void {
		var userData:HashMap<any> = (<any> data).response[0].data;
		var manager = new NotificationManager({
			app: app,
			// Remove the following line to actually connect to the XMPP service.
			startOnInitialize: false,
			connectionData: {
				jid: (<any> userData).account_email,
				session: (<any> userData).session
			}
		});

		document.getElementById('waiting').classList.add('is-hidden');
		document.getElementById('testActions').classList.remove('is-hidden');

		var countSpan = document.getElementById('newMessageCount');
		var count = Number(countSpan.firstChild.nodeValue);
		document.getElementById('addMessage').addEventListener('click', function () {
			manager.add({
				id: 12345,
				type: 'message',
				isRead: false,
				item: new Message({ id: 23456 })
			}).then(function () {
				countSpan.firstChild.nodeValue = String(++count);
			});
		});

		document.getElementById('getNotifications').addEventListener('click', function () {
			console.log('contacting ' + endpoints.notifications + '...');
			// TODO: this currently is not working courtesy of CORS
			request.post(endpoints.notifications, {
				handleAs: 'json',
				headers: {
					apikey: 'bbPSzZ3jldbps3boO1hzom5RNn9tVMnT',
					app: (<any> userData).app,
					sessionId: (<any> userData).session
				}
			}).then(function (data:HashMap<any>):void {
				console.log(data);
			});
		});
	});
});

export = app;
