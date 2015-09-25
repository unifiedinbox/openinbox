import Widget = require('mayhem/ui/Widget');
import DropDown = require('./DropDown');

export function closeDropDowns(widget:Widget):void {
	if (widget) {
		var parent = widget;
		do {
			if (parent instanceof DropDown) {
				parent.set('isOpen', false);
				break;
			}
		} while (parent = parent.get('parent'));
	}
}
