import ngModule from './_module';

ngModule.directive('jloChatbarChatInternal', function($animate) {
	return {
		require: ['jloChatbarChatInternal', '^^jloChatbar'],
		restrict: 'AE',
		controller: function () {},
		link: function internalDirective($scope, $element, $attrs, ctrls) {
			var ctrl = ctrls[0],
				jloChatbarCtrl = ctrls[1]
			;

			if (!jloChatbarCtrl.minimizedTransclude && !jloChatbarCtrl.openTransclude) {
				return ;
			}
			
			var scope = $scope.$new(),
				elts = {},
				facade = {
					remove: function() {
						jloChatbarCtrl.remove(ctrl.chat);
					},
					minimize: function() {
						jloChatbarCtrl.minimize(ctrl.chat);
					},
					open: function(focus) {
						jloChatbarCtrl.open(ctrl.chat, focus);
					}
				}
			;

			ctrl.chat = $scope.chat;
			jloChatbarCtrl.chatVarName && (scope[jloChatbarCtrl.chatVarName] = ctrl.chat.data);
			jloChatbarCtrl.ctrlVarName && (scope[jloChatbarCtrl.ctrlVarName] = facade);

			$element.empty()
			.addClass('jlo-chatbar__chat')
			.toggleClass('jlo-chatbar__chat--open', $scope.chat.opened);

			$scope.$watch('chat', function (value) {
				ctrl.chat = value;
				scope[jloChatbarCtrl.chatVarName] = ctrl.chat.data;
			});
				
			$scope.$watch('chat.opened', function (value) {
				setTimeout(function () {
					elts.open && elts.open.toggleClass('jlo-chatbar__open--visible', value);
				}, 1);

				$animate[value ? 'addClass' : 'removeClass']($element, 'jlo-chatbar__chat--open');
			});
			
			if (jloChatbarCtrl.openTransclude) {
				jloChatbarCtrl.openTransclude(scope, function (clone, scope) {
					elts.open = clone;
					clone.addClass('jlo-chatbar__open');
					$animate.enter(clone, $element);
				});
			}
			
			if (jloChatbarCtrl.minimizedTransclude) {
				jloChatbarCtrl.minimizedTransclude(scope, function (clone, scope) {
					elts.minimized = clone;
					clone.addClass('jlo-chatbar__minimized');
					$animate.enter(clone, $element);
				});
			}
		}
	};
});
