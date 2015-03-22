import ngModule from './_module';
import {applyHeight} from './utils';

function internalDirective(transcludeFnName, className, open) {
	return function ($scope, $element, $attrs, ctrl) {
		if (!ctrl[transcludeFnName]) {
			return ;
		}
		
		var transcludedScope,
			chat = $scope.$eval('chat'),
			elt,
			info = {},
			facade = {
				remove: function() {
					ctrl.remove(chat);
				},
				minimize: function() {
					ctrl.minimize(chat);
				},
				open: function() {
					ctrl.open(chat);
				}
			}
		;
		
		ctrl[transcludeFnName](function (clone, scope) {
			transcludedScope = scope;
			ctrl.chatVarName && (scope[ctrl.chatVarName] = chat.data);
			ctrl.ctrlVarName && (scope[ctrl.ctrlVarName] = facade);
			elt = clone;
			$element.empty();
			$element.after(clone);
			$element.remove();
			clone.addClass(className);
			if (open && ctrl.height) {
				applyHeight(clone, ctrl.height);
			}
		});
		
		open && $scope.$watch('chat.opened', function (value) {
			setTimeout(function () {
				elt.toggleClass(className + '--visible', value);
			}, 1);
		});
		
		$scope.$watch('chat', function (value) {
			chat = value;
			ctrl.chatVarName && (transcludedScope[ctrl.chatVarName] = chat.data);
		});
	};
}

ngModule.directive('jloChatbarMinimizedInternal', function() {
	return {
		require: '^^jloChatbar',
		restrict: 'AE',
		link: internalDirective('minimizedTransclude', 'jlo-chatbar__minimized')
	};
});

ngModule.directive('jloChatbarOpenInternal', function() {
	return {
		require: '^^jloChatbar',
		restrict: 'AE',
		link: internalDirective('openTransclude', 'jlo-chatbar__open', true)
	};
});
