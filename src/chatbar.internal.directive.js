import ngModule from './_module';

ngModule.directive('jloChatbarChatInternal', function ($animate, $timeout) {
	return {
		require: ['jloChatbarChatInternal', '^^jloChatbar'],
		restrict: 'AE',
		controller: function () {},
		link: function internalDirective($scope, $element, $attrs, ctrls) {
			var ctrl = ctrls[0],
				jloChatbarCtrl = ctrls[1]
			;

			if (!jloChatbarCtrl.$transclude) {
				return ;
			}

			let scope = $scope.$new(),
				facade = {
					remove: () => jloChatbarCtrl.remove(ctrl.chat),
					minimize: () => jloChatbarCtrl.minimize(ctrl.chat),
					open: (focus) => jloChatbarCtrl.open(ctrl.chat, focus),
					focus: () => jloChatbarCtrl.focus(ctrl.chat)
				}
			;

			ctrl.chat = $scope.chat;
			jloChatbarCtrl.chatVarName && (scope[jloChatbarCtrl.chatVarName] = ctrl.chat.data);
			jloChatbarCtrl.ctrlVarName && (scope[jloChatbarCtrl.ctrlVarName] = facade);

			$element.empty()
			.addClass('jlo-chatbar__chat');

			$scope.$watch('chat', function (value) {
				ctrl.chat = value;
				scope[jloChatbarCtrl.chatVarName] = ctrl.chat.data;
			});

			$scope.$watch('chat.opened', function (value) {
				scope.$closed = false;
				scope.$opened = false;

				//to allow ng-move to be done before animating the opening
				$timeout(function () {
					$element.toggleClass('jlo-chatbar__chat--minimized', !value);
					$animate[!!value ? 'addClass' : 'removeClass']($element, 'jlo-chatbar__chat--open')
					.then(() => scope.$apply(() => (
						scope.$closed = !value,
						scope.$opened = !!value
					)));
				}, 1);
			});

			jloChatbarCtrl.$transclude(scope, (clone) => $animate.enter(clone, $element));
		}
	};
});
