function initResizer(resizerElt, chatElt) {
	var startY, startHeight
	;

	function doDrag(e) {
		chatElt.css('height', (startHeight + startY - e.clientY) + 'px');
		chatElt.triggerHandler('jlo-chat-resize');
	}

	function stopDrag() {
		angular.element(document.body)
		.removeClass('jlo-chatbar-noselect');
		angular.element(document)
		.off('mousemove', doDrag)
		.off('mouseup', stopDrag);
	}

	function initDrag(e) {
		chatElt.data('jlo-chatbar-chat-resized', true);

		startY = e.clientY;
		startHeight = parseInt(document.defaultView.getComputedStyle(chatElt[0]).height, 10);

		angular.element(document.body)
		.addClass('jlo-chatbar-noselect');
		angular.element(document)
		.on('mousemove', doDrag)
		.on('mouseup', stopDrag);
	}

	resizerElt.on('mousedown', initDrag);
}

export {initResizer};
