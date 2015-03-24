function initResizer(resizerElt, chatElt) {
	var startX, startY, startWidth, startHeight
	;
	
	resizerElt.on('mousedown', initDrag);
	
	function doDrag(e) {
		chatElt.css('height', (startHeight + startY - e.clientY) + 'px');
	}
	
	function stopDrag(e) {
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
}

export {initResizer};
