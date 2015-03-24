import ngModule from './_module';
import {initResizer} from './utils';

ngModule.directive('jloChatbar', function() {
	return {
		restrict: 'AE',
		transclude: true,
		scope: true,
		controller: function ($scope, $element, $attrs, $window, jloChatbar) {
			var _this = this;
			$element.addClass('jlo-chatbar');
			
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
		},
		controllerAs: 'chatBarCtrl',
		template: [
			'<div style="display:none;" ng-transclude></div>',
			'<jlo-chatbar-chat-internal ng-repeat="chat in chatBarCtrl.chatList track by chat.id">',
			'</jlo-chatbar-chat-internal>'
		].join('')
	};
});

ngModule.directive('jloChatbarMinimized', function() {
	return {
		require: '^^jloChatbar',
		restrict: 'E',
		priority: 700,
		terminal: true,
		transclude: 'element',
		link: function ($scope, $element, $attrs, ctrl, $transclude) {
			ctrl.minimizedTransclude = $transclude;
		}
	};
});

ngModule.directive('jloChatbarOpen', function() {
	return {
		require: '^^jloChatbar',
		restrict: 'E',
		priority: 700,
		terminal: true,
		transclude: 'element',
		link: function ($scope, $element, $attrs, ctrl, $transclude) {
			ctrl.openTransclude = $transclude;
		}
	};
});

ngModule.directive('jloChatbarResizer', function() {
	return {
		require: '^^jloChatbarChatInternal',
		restrict: 'AE',
		transclude: 'element',
		link: function ($scope, $element) {
			var chatElt, chatOpenElt,
				resizerElt
			;
	
			chatElt = $element;			
			do {
				chatElt = chatElt.parent();
			} while (chatElt.length && chatElt[0] !== document && chatElt[0].tagName.toLowerCase() !== 'jlo-chatbar-open');
			
			if (!chatElt.length || chatElt[0] === document) {
				throw new Error('jlo-chatbar-resizer must be inside jlo-chatbar-open');
			}

			resizerElt = angular.element('<div class="jlo-chatbar__resizer"></div>');
			
			$element.after(resizerElt);
			$element.remove();
			
			initResizer(resizerElt, chatElt);
		}
	};
});

ngModule.directive('jloChatbarFocus', function($q, $window) {
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
