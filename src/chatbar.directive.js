import ngModule from './_module';
import {serviceData} from './chatbar.service';
import {applyHeight, initResizer} from './utils';

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
			
			this.open = function (chat) {
				chat.opened = true;
			};
			
			this.minimize = function (chat) {
				chat.opened = false;
			};
			
			this.remove = function (chat) {
				jloChatbar.removeChat(chat.data);
			};
			
			this.height = {};
			
			if (serviceData.maxHeight || serviceData.height) {
				let onResize = function () {
					var windowHeight = $window.innerHeight;
					_this.height = {
						maxHeight: serviceData.maxHeight && serviceData.maxHeight(windowHeight),
						height: serviceData.height && serviceData.height(windowHeight)
					};
					applyHeight($element.find('jlo-chatbar-open'), _this.height);
				};
				onResize();
				
				angular.element($window).on('resize', onResize);
				
				$scope.$on('$destroy', function () {
					angular.element($window).off('resize', onResize);
				});
			}
		},
		controllerAs: 'chatBarCtrl',
		template: [
			'<div style="display:none;" ng-transclude></div>',
			'<div ng-repeat="chat in chatBarCtrl.chatList track by chat.id"',
				' class="jlo-chatbar__chat" ng-class="{\'jlo-chatbar__chat--open\': chat.opened}">',
				'<jlo-chatbar-minimized-internal></jlo-chatbar-minimized-internal>',
				'<jlo-chatbar-open-internal></jlo-chatbar-open-internal>',
			'</div>'
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
		restrict: 'AE',
		transclude: 'element',
		link: function ($scope, $element) {
			var chatElt,
				resizerElt
			;
	
			chatElt = $element;			
			do {
				chatElt = chatElt.parent();
			} while (chatElt.length && chatElt[0].tagName.toLowerCase() !== 'jlo-chatbar-open');
			
			if (!chatElt.length) {
				throw new Error('jlo-chatbar-resizer must be inside jlo-chatbar-open');
			}

			resizerElt = angular.element('<div class="jlo-chatbar__resizer"></div>');
			
			$element.after(resizerElt);
			$element.remove();
			
			initResizer(resizerElt);
		}
	};
});
