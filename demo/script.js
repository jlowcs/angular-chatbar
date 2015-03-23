define('app', ['angular-chatbar'], function () {
	angular.module('exampleApp', ['jlo-chatbar', 'ngAnimate'])
	.config(function (jloChatbarProvider) {
		jloChatbarProvider.chatId('_id');
		jloChatbarProvider.height('30%');
		jloChatbarProvider.maxHeight(function (windowHeight) {
			return windowHeight - 50;
		});
	})
	.controller('MyCtrl', function ($element, jloChatbar) {
		var NAMES = ['John', 'Roger', 'Bob', 'Jim', 'Susan', 'Alice', 'Marie'],
			chat, i, j, len
		;
		
		this.chatList = [];
		for (i = 0; i < 9; ++i) {
			chat = {
				_id: i+1,
				title: 'Chat '+(i+1),
				contacts: []
			};
			for (j = 0, len = Math.floor(Math.random() * 3 + 1); j < len; ++j) {
				chat.contacts.push(NAMES[Math.floor(Math.random() * NAMES.length)]);
				chat.contacts = chat.contacts.filter(function (contact, idx) {
					return chat.contacts.indexOf(contact) === idx;
				});
			}
			this.chatList.push(chat);  
		}
		
		for (i = 0; i < 5; ++i) {
			jloChatbar.addChat(this.chatList[i]);
		}
		
		this.openChat = function (chat) {
			jloChatbar.addChat(chat, true, true);
		};
		
		this.getTestData = function (chat) {
			return Array(chat._id + 1).join(chat._id);
		};
		
		this.getColor = function (chat) {
			return 'rgb(' +
				chat._id * (chat._id % 2 ? 20 : 10) +
				',' +
				Math.abs(chat._id - 10) * (chat._id % 2 ? 10 : 20) +
				',' +
				(chat._id < 5 ? chat._id + 5 : chat._id - 5) * (chat._id % 2 ? 10 : 20) +
				')';
		};
		
		$element.on('click', function (e) {
			if (e.target === this) {
				console.log('click main!');
			}
		});
	});
});

require(["app"],function(){
	angular.bootstrap(document,["exampleApp"]);
});

