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

			ctrl.element = $element;

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
				jloChatbarCtrl.chatVarName && (scope[jloChatbarCtrl.chatVarName] = ctrl.chat.data);
			});

			$scope.$watch('chat.open', function (value, oldValue) {
				scope.$closed = false;
				scope.$open = false;

				function toggle() {
					$element.toggleClass('jlo-chatbar__chat--closed', !value);
					$animate[!!value ? 'addClass' : 'removeClass']($element, 'jlo-chatbar__chat--open')
					.then(() => scope.$apply(() => (
						scope.$closed = !value,
						scope.$open = !!value
					)));
				}

				if (typeof oldValue !== 'undefined' && (value !== oldValue)) {
					//to allow ng-move to be done before animating the opening
					$timeout(toggle, 1);
				} else {
					toggle();
				}

			});

			jloChatbarCtrl.$transclude(scope, (clone) => $animate.enter(clone, $element));
		}
	};
});
