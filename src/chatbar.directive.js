import ngModule from './_module';
import {initResizer} from './utils';

ngModule.directive('jloChatbar', function () {
	return {
		restrict: 'AE',
		transclude: true,
		scope: true,
		controller: function ($scope, $element, $attrs, $window, $transclude, jloChatbar) {
			$element.addClass('jlo-chatbar');

			this.$transclude = $transclude;

			this.$scope = $scope;

			this.chatList = jloChatbar.list;

			this.chatVarName = $attrs.chat;
			this.ctrlVarName = $attrs.ctrl;

			this.open = function (chat, focus) {
				chat.opened = true;
				focus && jloChatbar.focusChat(chat.data);
			};

			this.minimize = function (chat) {
				chat.opened = false;
			};

			this.remove = function (chat) {
				jloChatbar.removeChat(chat.data);
			};

			this.focus = function (chat) {
				jloChatbar.focusChat(chat.data);
			};
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
		link: function ($scope, $element) {
			var chatElt, resizerElt
			;

			chatElt = $element;
			do {
				chatElt = chatElt.parent();
			} while (chatElt.length && chatElt[0] !== document && chatElt[0].tagName.toLowerCase() !== 'jlo-chatbar-chat-internal');

			if (!chatElt.length || chatElt[0] === document) {
				throw new Error('jlo-chatbar-resizer must be inside jlo-chatbar-chat-internal');
			}

			resizerElt = angular.element('<div class="jlo-chatbar__resizer"></div>');

			$element.after(resizerElt);
			$element.remove();

			initResizer(resizerElt, chatElt);
		}
	};
});

ngModule.directive('jloChatbarFocus', function ($q, $window) {
	return {
		require: '^^jloChatbarChatInternal',
		restrict: 'AE',
		link: function ($scope, $element, $attrs, ctrl) {
			$scope.$on('jlo.chatbar.focus', function (event, chat) {
				if (chat === ctrl.chat.data) {
					setTimeout(function () {
						$element[0].focus();
						$window.scrollTo(0, 0); //because focus moves out of viewport
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

			$element.on('scroll', function () {
				isBottom = this.scrollTop + this.offsetHeight >= this.scrollHeight;
			});

			if (ctrl) {
				let chatElt = $element;
				do {
					chatElt = chatElt.parent();
				} while (chatElt.length && chatElt[0] !== document && chatElt[0].tagName.toLowerCase() !== 'jlo-chatbar-chat-internal');

				chatElt.on('jlo-chat-resize', function () {
					isBottom && ($element[0].scrollTop = $element[0].scrollHeight);
				});
			}

			function onResize() {
				resizeTimeout && clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(function () {
					isBottom && ($element[0].scrollTop = $element[0].scrollHeight);
					resizeTimeout = undefined;
				}, 100);
			}

			angular.element($window).on('resize', onResize);

			$scope.$on('$destroy', function () {
				angular.element($window).off('resize', onResize);
			});

			isBottom = true;

			if (watchExpr) {
				$scope.$watchCollection(function () {
					return [].concat($scope.$eval(watchExpr));
				}, function () {
					isBottom && ($element[0].scrollTop = $element[0].scrollHeight);
				});
			} else {
				setTimeout(function () {
					$element[0].scrollTop = $element[0].scrollHeight;
				});
			}
		}
	};
});
