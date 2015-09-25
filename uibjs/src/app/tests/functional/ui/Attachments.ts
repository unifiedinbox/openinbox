/// <amd-dependency path="intern/dojo/node!leadfoot/helpers/pollUntil" />

import assert = require('intern/chai!assert');
import registerSuite = require('intern!object');
var pollUntil:any = require('intern/dojo/node!leadfoot/helpers/pollUntil');

registerSuite({
	name: 'app/ui/Attachments',

	beforeEach() {
		return this.remote.get(require.toUrl('../../ui/Attachments.html'))
			.then(pollUntil(function () {
				return (<any> window).ready;
			}, null, 5000));
	},

	previewUrl() {
		// Ensure that an image preview (via background-image style) exists on the first item
		return this.remote
			.findByCssSelector('.Attachments-item:first-child')
				.findByCssSelector('.Attachments-image')
					.getAttribute('style').then(function (style:string) {
						assert.notStrictEqual(style.indexOf('background-image'), -1,
							'First attachment on page should contain image preview using background-image');
					})
					.end(2);
	},

	'no previewUrl'() {
		// Ensure that a file icon (via icon-app-file-* class) exists on the last item
		return this.remote
			.findByCssSelector('.Attachments-item:last-child')
				.findByCssSelector('[class^="icon-app-file-"]')
					.end(2);
	},

	'delete'() {
		// Open the menu and click the delete entry and ensure the item is removed
		return this.remote
			.findAllByCssSelector('.Attachments-item')
				.then(function (elements:any[]) {
					assert.strictEqual(elements.length, 2, 'Expected 2 items on the page initially');
				})
				.end()
			.findByCssSelector('.Attachments-item:last-child')
				.findByCssSelector('.icon-app-menu')
					.click()
					.end(2)
			.findByCssSelector('.DropDownContainer.open .icon-app-delete')
				.click()
				.end()
			.findAllByCssSelector('.Attachments-item')
				.then(function (elements:any[]) {
					// TODO: do I need to wait?
					assert.strictEqual(elements.length, 1, 'Expected 1 item on the page after removal');
				})
				.end();
	}
});
