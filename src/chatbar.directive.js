import ngModule from './_module';
import {initResizer} from './utils';

ngModule.directive('jloChatbar', function () {
	return {
		restrict: 'AE',
		transclude: true,
		scope: true,
		controller: function ($scope, $element, $attrs, $transclude, jloChatbar) {
			var expr = $attrs.jloChatbar || $attrs.chatData,
				matches
			;

			if (!expr) {
				throw new Error('Missing chat-data attribute');
			}

			$element.addClass('jlo-chatbar');

			matches = expr.match(/^\s*(.+?)(?:\s+controlled\s+by\s+(.+))?\s*$/);

			this.chatVarName = matches[1];
			this.ctrlVarName = matches[2];

			this.$transclude = $transclude;

			this.$scope = $scope;

			this.chatList = jloChatbar.list;

			this.open = (chat, focus) => (chat.open = true, focus && jloChatbar.focusChat(chat.data));
			this.minimize = (chat) => chat.open = false;
			this.remove = (chat) => jloChatbar.removeChat(chat.data);
			this.focus = (chat) => jloChatbar.focusChat(chat.data);
		},
		controllerAs: 'chatBarCtrl',
		template: [
			'<jlo-chatbar-chat-internal ng-repeat="chat in chatBarCtrl.chatList track by chat.id" tabindex="-1">', //tabindex is for mouse wheel scrolling
			'</jlo-chatbar-chat-internal>'
		].join('')
	};
});

ngModule.directive('jloChatbarResizer', function () {
	return {
		require: '^^jloChatbarChatInternal',
		restrict: 'AE',
		transclude: 'element',
		link: function ($scope, $element, $attrs, ctrl) {
			var resizerElt;

			resizerElt = angular.element('<div class="jlo-chatbar__resizer"></div>');

			$element.after(resizerElt);
			$element.remove();

			initResizer(resizerElt, ctrl.element);
		}
	};
});

ngModule.directive('jloChatbarFocus', function ($q, $window) {
	return {
		require: '^^?jloChatbarChatInternal',
		restrict: 'AE',
		link: function ($scope, $element, $attrs, ctrl) {
			ctrl && $scope.$on('jlo.chatbar.focus', function (event, chat) {
				if (chat === ctrl.chat.data) {
					setTimeout(function () {
						$element[0].focus();
						$window.scrollTo(0, 0); //because focus moves out of viewport
						ctrl.element[0].scrollTop = 0;
					}, $attrs.jloChatbarFocus && parseInt($attrs.jloChatbarFocus, 10) || 1);
				}
			});
		}
	};
});

ngModule.directive('jloChatbarScroll', function ($window) {
	return {
		require: '^^?jloChatbarChatInternal',
		restrict: 'AE',
		link: function ($scope, $element, $attrs, ctrl) {
			var isBottom,
				expr = $attrs.jloChatbarScroll || '',
				matches,
				watchExpr,
				resizeTimeout
			;

			matches = expr.match(/^\s*(?:autoscroll\s+on\s+(.+))?\s*$/);

			watchExpr = matches[1];

			function updateScroll() {
				if (isBottom) {
					$element[0].scrollTop = $element[0].scrollHeight;
					setTimeout(() => { //for after digest is finished
						$element[0].scrollTop = $element[0].scrollHeight;
						setTimeout(() => { //for after rendering is finished
							$element[0].scrollTop = $element[0].scrollHeight;
						}, 1);
					}, 1);
				}
			}

			//update isBottom state when scrolled
			$element.on('scroll', function () {
				//2px error margin just to be sure for when the browser is not rounding up perfectly
				isBottom = this.scrollTop + this.offsetHeight >= (this.scrollHeight - 2);
			});

			//update scroll when chat is resized
			if (ctrl) {
				ctrl.element.on('jlo-chat-resize', updateScroll);
				$scope.$on('$destroy', () => ctrl.element.off('jlo-chat-resize', updateScroll));
			}

			//update scroll when window is resized
			function onResize() {
				resizeTimeout && clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(function () {
					updateScroll();
					resizeTimeout = undefined;
				}, 100);
			}
			angular.element($window).on('resize', onResize);
			$scope.$on('$destroy', () => angular.element($window).off('resize', onResize));

			//initial update scroll
			isBottom = true;
			if (watchExpr) {
				$scope.$watchCollection(() => [].concat($scope.$eval(watchExpr)), updateScroll);
			} else {
				setTimeout(updateScroll, 1);
			}
		}
	};
});
