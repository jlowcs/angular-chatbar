(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("angular-chatbar/_module", ["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  }
})(function (exports) {
  "use strict";

  exports["default"] = angular.module("jlo-chatbar", []);
});
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("angular-chatbar", ["exports", "angular-chatbar/chatbar"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("angular-chatbar/chatbar"));
  }
})(function (exports, _angularChatbarChatbar) {
  "use strict";
});
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/chatbar.directive", ["exports", "./_module", "./utils"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("./_module"), require("./utils"));
	}
})(function (exports, _module2, _utils) {
	"use strict";

	var ngModule = _module2["default"];
	var initResizer = _utils.initResizer;

	ngModule.directive("jloChatbar", function () {
		return {
			restrict: "AE",
			transclude: true,
			scope: true,
			controller: function controller($scope, $element, $attrs, $window, $transclude, jloChatbar) {
				$element.addClass("jlo-chatbar");

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
			controllerAs: "chatBarCtrl",
			template: ["<jlo-chatbar-chat-internal ng-repeat=\"chat in chatBarCtrl.chatList track by chat.id\" tabindex=\"-1\">", //tabindex is for mouse wheel scrolling
			"</jlo-chatbar-chat-internal>"].join("")
		};
	});

	ngModule.directive("jloChatbarResizer", function () {
		return {
			require: "^^jloChatbarChatInternal",
			restrict: "AE",
			transclude: "element",
			link: function link($scope, $element) {
				var chatElt, resizerElt;

				chatElt = $element;
				do {
					chatElt = chatElt.parent();
				} while (chatElt.length && chatElt[0] !== document && chatElt[0].tagName.toLowerCase() !== "jlo-chatbar-chat-internal");

				if (!chatElt.length || chatElt[0] === document) {
					throw new Error("jlo-chatbar-resizer must be inside jlo-chatbar-chat-internal");
				}

				resizerElt = angular.element("<div class=\"jlo-chatbar__resizer\"></div>");

				$element.after(resizerElt);
				$element.remove();

				initResizer(resizerElt, chatElt);
			}
		};
	});

	ngModule.directive("jloChatbarFocus", function ($q, $window) {
		return {
			require: "^^jloChatbarChatInternal",
			restrict: "AE",
			link: function link($scope, $element, $attrs, ctrl) {
				$scope.$on("jlo.chatbar.focus", function (event, chat) {
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

	ngModule.directive("jloChatbarScroll", function ($window) {
		return {
			require: "^^?jloChatbarChatInternal",
			restrict: "AE",
			link: function link($scope, $element, $attrs, ctrl) {
				var isBottom,
				    expr = $attrs.jloChatbarScroll || "",
				    matches,
				    watchExpr,
				    resizeTimeout;

				matches = expr.match(/^\s*(?:autoscroll\s+on\s+(.+))?\s*$/);

				watchExpr = matches[1];

				$element.on("scroll", function () {
					isBottom = this.scrollTop + this.offsetHeight >= this.scrollHeight;
				});

				if (ctrl) {
					var chatElt = $element;
					do {
						chatElt = chatElt.parent();
					} while (chatElt.length && chatElt[0] !== document && chatElt[0].tagName.toLowerCase() !== "jlo-chatbar-chat-internal");

					chatElt.on("jlo-chat-resize", function () {
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

				angular.element($window).on("resize", onResize);

				$scope.$on("$destroy", function () {
					angular.element($window).off("resize", onResize);
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
});
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/chatbar.internal.directive", ["exports", "./_module"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("./_module"));
	}
})(function (exports, _module2) {
	"use strict";

	var ngModule = _module2["default"];

	ngModule.directive("jloChatbarChatInternal", function ($animate, $timeout) {
		return {
			require: ["jloChatbarChatInternal", "^^jloChatbar"],
			restrict: "AE",
			controller: function controller() {},
			link: function internalDirective($scope, $element, $attrs, ctrls) {
				var ctrl = ctrls[0],
				    jloChatbarCtrl = ctrls[1];

				if (!jloChatbarCtrl.$transclude) {
					return;
				}

				var scope = $scope.$new(),
				    facade = {
					remove: function () {
						return jloChatbarCtrl.remove(ctrl.chat);
					},
					minimize: function () {
						return jloChatbarCtrl.minimize(ctrl.chat);
					},
					open: function (focus) {
						return jloChatbarCtrl.open(ctrl.chat, focus);
					},
					focus: function () {
						return jloChatbarCtrl.focus(ctrl.chat);
					}
				};

				ctrl.chat = $scope.chat;
				jloChatbarCtrl.chatVarName && (scope[jloChatbarCtrl.chatVarName] = ctrl.chat.data);
				jloChatbarCtrl.ctrlVarName && (scope[jloChatbarCtrl.ctrlVarName] = facade);

				$element.empty().addClass("jlo-chatbar__chat");

				$scope.$watch("chat", function (value) {
					ctrl.chat = value;
					scope[jloChatbarCtrl.chatVarName] = ctrl.chat.data;
				});

				$scope.$watch("chat.opened", function (value) {
					scope.$closed = false;
					scope.$opened = false;

					//to allow ng-move to be done before animating the opening
					$timeout(function () {
						$element.toggleClass("jlo-chatbar__chat--minimized", !value);
						$animate[!!value ? "addClass" : "removeClass"]($element, "jlo-chatbar__chat--open").then(function () {
							return scope.$apply(function () {
								return (scope.$closed = !value, scope.$opened = !!value);
							});
						});
					}, 1);
				});

				jloChatbarCtrl.$transclude(scope, function (clone) {
					return $animate.enter(clone, $element);
				});
			}
		};
	});
});
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("angular-chatbar/chatbar", ["exports", "./chatbar.internal.directive", "./chatbar.directive", "./chatbar.service"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./chatbar.internal.directive"), require("./chatbar.directive"), require("./chatbar.service"));
  }
})(function (exports, _chatbarInternalDirective, _chatbarDirective, _chatbarService) {
  "use strict";
});
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/chatbar.service", ["exports", "./_module"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("./_module"));
	}
})(function (exports, _module2) {
	"use strict";

	var ngModule = _module2["default"];

	ngModule.provider("jloChatbar", function () {
		var _chatId;

		this.chatId = function (val) {
			if (!angular.isFunction(val)) {
				_chatId = function (chat) {
					return chat[val];
				};
				return;
			}

			_chatId = val;
		};

		this.chatId("id");

		this.$get = function ($rootScope, $timeout) {
			var service = {
				list: []
			};

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
				    current;

				if (idx !== -1) {
					current = service.list.splice(idx, 1)[0];
				}

				opened = current && current.opened || !!opened;

				service.list.unshift(Object.defineProperties({
					data: chat,
					opened: opened
				}, {
					id: {
						get: function () {
							return _chatId(this.data);
						},
						configurable: true,
						enumerable: true
					}
				}));

				if (opened && focus) {
					$timeout(function () {
						return $rootScope.$broadcast("jlo.chatbar.focus", chat);
					});
				}
			};

			service.focusChat = function (chat) {
				var idx = indexOfChat(chat);

				if (idx !== -1) {
					$timeout(function () {
						return $rootScope.$broadcast("jlo.chatbar.focus", service.list[idx].data);
					});
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
});
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/utils", ["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	}
})(function (exports) {
	"use strict";

	function initResizer(resizerElt, chatElt) {
		var startY, startHeight;

		function doDrag(e) {
			chatElt.css("height", startHeight + startY - e.clientY + "px");
			chatElt.triggerHandler("jlo-chat-resize");
		}

		function stopDrag() {
			angular.element(document.body).removeClass("jlo-chatbar-noselect");
			angular.element(document).off("mousemove", doDrag).off("mouseup", stopDrag);
		}

		function initDrag(e) {
			chatElt.data("jlo-chatbar-chat-resized", true);

			startY = e.clientY;
			startHeight = parseInt(document.defaultView.getComputedStyle(chatElt[0]).height, 10);

			angular.element(document.body).addClass("jlo-chatbar-noselect");
			angular.element(document).on("mousemove", doDrag).on("mouseup", stopDrag);
		}

		resizerElt.on("mousedown", initDrag);
	}

	exports.initResizer = initResizer;
});