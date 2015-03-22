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
	
	this.$get = function () {
		var list = [],
			res = {}
		;
		
		function indexOfChat(chat) {
			return list.reduce(function (res, c, index) {
				if (res >= 0) {
					return res;
				}
				if (c.data === chat) {
					return index;
				}
				return res;
			}, -1);
		}
		
		res.addChat = function (chat, opened) {
			var idx = indexOfChat(chat),
				current
			;
			if (idx !== -1) {
				current = list[idx];
				list.splice(idx, 1);
			}
			list.unshift({
				get id() {
					return _chatId(this.data);
				},
				data: chat,
				opened: current && current.opened || !!opened
			});
		};
		
		res.removeChat = function (chat) {
			var idx = indexOfChat(chat);
			if (idx !== -1) {
				list.splice(idx, 1);
			}
		};
		
		Object.defineProperty(res, 'list', {
			get: function () {
				return list;
			}
		});
		
		return res;
	};
});

export {serviceData};
