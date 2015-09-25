/// <amd-dependency path="mayhem/templating/html!./MessageRowTestPageTemplate.html" />

import app = require('../app');
import Folder = require('app/models/Folder');
import LoginServiceMock = require('../../mocks/Login'); LoginServiceMock;
import Message = require('app/models/Message');
import MessageProxy = require('app/viewModels/MessageList');
import mocks = require('./mockMessageData');
import on = require('dojo/on');
import Promise = require('mayhem/Promise');

// Override the default scenario so the tests can execute properly.
import MessageScenarios = require('../../support/scenarios/Message'); MessageScenarios;

var View = require<any>('mayhem/templating/html!./MessageRowTestPageTemplate.html');

app.run().then(function ():void {
	var user = <any> app.get('user');
	user.login({
		username: 'test',
		password: 'pass'
	}).then(function () {
		Promise.all([
			mocks.folders(),
			mocks.attachments(),
			mocks.contacts(),
			mocks.messages()
		]).then(function () {
			user.set('folders', Folder.store);

			Message.get(0).then(function (message:Message):void {
				var messageProxy = new MessageProxy({
					target: message
				});
				// This is a hack to force the proxy to set the attachments. It's not needed
				// when used with MessageProxy.forCollection.
				messageProxy.set('attachments', message.get('attachments'));

				var view = new View({
					app: app,
					model: messageProxy
				});
				app.get('ui').set('view', view);

				on(document.getElementById('toggleAttachments'), 'click', function () {
					messageProxy.set('isFiltered', !messageProxy.get('isFiltered'));
				});

				on(document.getElementById('setPrivacy'), 'change', function (event) {
					var node:HTMLSelectElement = <any> event.target;
					var value:string = node[node.selectedIndex].value;

					messageProxy.set('privacyStatus', value);
				});

				on(document.getElementById('toggleAction'), 'click', function (event) {
					messageProxy.set('forwarded', !messageProxy.get('forwarded'));
					messageProxy.set('replied', !messageProxy.get('replied'));
				});

				on(document.getElementById('toggleComments'), 'click', function (event) {
					var hasComments = Boolean(messageProxy.get('commentCount'));
					var count:number = hasComments ? 0 : 1;

					messageProxy.set('commentCount', count);
				});

				on(document.getElementById('setSubject'), 'click', function (event) {
					var input = <HTMLInputElement> ((<HTMLElement> event.target).previousElementSibling);

					messageProxy.set('subject', input.value);
				});
			});
		});
	});
});

export = app;
