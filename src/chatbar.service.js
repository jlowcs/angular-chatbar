import ngModule from './_module';

var serviceData = {
	maxHeight: undefined,
	height: undefined
};

function serviceDataSizeFieldSetter(serviceDataField) {
	return function (val) {
		if (!angular.isFunction(val)) {
			if (val.match(/%$/)) {
				val = parseInt(val);
				serviceData[serviceDataField] = function (windowHeight) {
					return windowHeight * val / 100;
				};
				return ;
			}
			
			serviceData[serviceDataField] = function () {
				return val;
			};
			return ;
		}
		
		serviceData[serviceDataField] = val;
	};
}

ngModule.provider('jloChatbar', function () {
	var _chatId;
	
	this.chatId = function (val) {
		if (!angular.isFunction(val)) {
			_chatId = function (chat) {
				return chat[val];
			};
			return ;
		}
		
		_chatId = val;
	};
	
	this.chatId('id');
	
	this.maxHeight = serviceDataSizeFieldSetter('maxHeight');
	this.height = serviceDataSizeFieldSetter('height');
	
	this.$get = function ($rootScope, $timeout) {
		var service = {
				list: []
			}
		;
		
		function indexOfChat(chat) {
			return service.list.reduce(function (res, c, index) {
				if (res >= 0) {
					return res;
				}
				if (c.data === chat) {
					return index;
				}
				return res;
			}, -1);
		}
		
		service.addChat = function (chat, opened, focus) {
			var idx = indexOfChat(chat),
				current
			;

			if (idx !== -1) {
				current = service.list.splice(idx, 1)[0];
			}

			opened = current && current.opened || !!opened;

			service.list.unshift({
				get id() {
					return _chatId(this.data);
				},
				data: chat,
				opened: opened
			});
			
			if (opened && focus) {
				$timeout(() => $rootScope.$broadcast('jlo.chatbar.focus', chat));
			}
		};
		
		service.focusChat = function (chat) {
			var idx = indexOfChat(chat),
				current
			;

			if (idx !== -1) {
				$timeout(() => $rootScope.$broadcast('jlo.chatbar.focus', service.list[idx].data));
			}
		};
		
		service.removeChat = function (chat) {
			var idx = indexOfChat(chat);
			if (idx !== -1) {
				service.list.splice(idx, 1);
			}
		};
		
		return service;
	};
});

export {serviceData};
