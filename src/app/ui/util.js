define(["require", "exports", './DropDown'], function (require, exports, DropDown) {
    function closeDropDowns(widget) {
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
    exports.closeDropDowns = closeDropDowns;
});
//# sourceMappingURL=util.js.map