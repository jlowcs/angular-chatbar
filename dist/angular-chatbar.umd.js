(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/chatbar.directive", ["exports", "./_module", "./chatbar.service", "./utils"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("./_module"), require("./chatbar.service"), require("./utils"));
	}
})(function (exports, _module2, _chatbarService, _utils) {
	"use strict";

	var ngModule = _module2["default"];
	var serviceData = _chatbarService.serviceData;
	var applyHeight = _utils.applyHeight;
	var initResizer = _utils.initResizer;

	ngModule.directive("jloChatbar", function () {
		return {
			restrict: "AE",
			transclude: true,
			scope: true,
			controller: function controller($scope, $element, $attrs, $window, jloChatbar) {
				var _this = this;
				$element.addClass("jlo-chatbar");

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
					(function () {
						var onResize = function onResize() {
							var windowHeight = $window.innerHeight;
							_this.height = {
								maxHeight: serviceData.maxHeight && serviceData.maxHeight(windowHeight),
								height: serviceData.height && serviceData.height(windowHeight)
							};
							applyHeight($element.find("jlo-chatbar-open"), _this.height);
						};
						onResize();

						angular.element($window).on("resize", onResize);

						$scope.$on("$destroy", function () {
							angular.element($window).off("resize", onResize);
						});
					})();
				}
			},
			controllerAs: "chatBarCtrl",
			template: ["<div style=\"display:none;\" ng-transclude></div>", "<div ng-repeat=\"chat in chatBarCtrl.chatList track by chat.id\"", " class=\"jlo-chatbar__chat\" ng-class=\"{'jlo-chatbar__chat--open': chat.opened}\">", "<jlo-chatbar-minimized-internal></jlo-chatbar-minimized-internal>", "<jlo-chatbar-open-internal></jlo-chatbar-open-internal>", "</div>"].join("")
		};
	});

	ngModule.directive("jloChatbarMinimized", function () {
		return {
			require: "^^jloChatbar",
			restrict: "E",
			priority: 700,
			terminal: true,
			transclude: "element",
			link: function link($scope, $element, $attrs, ctrl, $transclude) {
				ctrl.minimizedTransclude = $transclude;
			}
		};
	});

	ngModule.directive("jloChatbarOpen", function () {
		return {
			require: "^^jloChatbar",
			restrict: "E",
			priority: 700,
			terminal: true,
			transclude: "element",
			link: function link($scope, $element, $attrs, ctrl, $transclude) {
				ctrl.openTransclude = $transclude;
			}
		};
	});

	ngModule.directive("jloChatbarResizer", function () {
		return {
			restrict: "AE",
			transclude: "element",
			link: function link($scope, $element) {
				var chatElt, resizerElt;

				chatElt = $element;
				do {
					chatElt = chatElt.parent();
				} while (chatElt.length && chatElt[0].tagName.toLowerCase() !== "jlo-chatbar-open");

				if (!chatElt.length) {
					throw new Error("jlo-chatbar-resizer must be inside jlo-chatbar-open");
				}

				resizerElt = angular.element("<div class=\"jlo-chatbar__resizer\"></div>");

				$element.after(resizerElt);
				$element.remove();

				initResizer(resizerElt);
			}
		};
	});
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
		define("angular-chatbar/chatbar.internal.directive", ["exports", "./_module", "./utils"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports, require("./_module"), require("./utils"));
	}
})(function (exports, _module2, _utils) {
	"use strict";

	var ngModule = _module2["default"];
	var applyHeight = _utils.applyHeight;

	function internalDirective(transcludeFnName, className, open) {
		return function ($scope, $element, $attrs, ctrl) {
			if (!ctrl[transcludeFnName]) {
				return;
			}

			var transcludedScope,
			    chat = $scope.$eval("chat"),
			    elt,
			    info = {},
			    facade = {
				remove: function remove() {
					ctrl.remove(chat);
				},
				minimize: function minimize() {
					ctrl.minimize(chat);
				},
				open: function open() {
					ctrl.open(chat);
				}
			};

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

			open && $scope.$watch("chat.opened", function (value) {
				setTimeout(function () {
					elt.toggleClass(className + "--visible", value);
				}, 1);
			});

			$scope.$watch("chat", function (value) {
				chat = value;
				ctrl.chatVarName && (transcludedScope[ctrl.chatVarName] = chat.data);
			});
		};
	}

	ngModule.directive("jloChatbarMinimizedInternal", function () {
		return {
			require: "^^jloChatbar",
			restrict: "AE",
			link: internalDirective("minimizedTransclude", "jlo-chatbar__minimized")
		};
	});

	ngModule.directive("jloChatbarOpenInternal", function () {
		return {
			require: "^^jloChatbar",
			restrict: "AE",
			link: internalDirective("openTransclude", "jlo-chatbar__open", true)
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
					return;
				}

				serviceData[serviceDataField] = function () {
					return val;
				};
				return;
			}

			serviceData[serviceDataField] = val;
		};
	}

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

		this.maxHeight = serviceDataSizeFieldSetter("maxHeight");
		this.height = serviceDataSizeFieldSetter("height");

		this.$get = function () {
			var list = [],
			    res = {};

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
				    current;
				if (idx !== -1) {
					current = list[idx];
					list.splice(idx, 1);
				}
				list.unshift(Object.defineProperties({
					data: chat,
					opened: current && current.opened || !!opened
				}, {
					id: {
						get: function () {
							return _chatId(this.data);
						},
						configurable: true,
						enumerable: true
					}
				}));
			};

			res.removeChat = function (chat) {
				var idx = indexOfChat(chat);
				if (idx !== -1) {
					list.splice(idx, 1);
				}
			};

			Object.defineProperty(res, "list", {
				get: function get() {
					return list;
				}
			});

			return res;
		};
	});

	exports.serviceData = serviceData;
});
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define("angular-chatbar/utils", ["exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	}
})(function (exports) {
	"use strict";

	function applyHeight(elt, height) {
		if (height && elt.length) {
			!angular.isUndefined(height.maxHeight) && elt.css("max-height", height.maxHeight + "px");
			!angular.isUndefined(height.minHeight) && elt.css("min-height", height.minHeight + "px");
			angular.forEach(elt, function (e) {
				if (!angular.isUndefined(height.height) && !angular.element(e).data("jlo-chatbar-chat-resized")) {
					angular.element(e).css("height", height.height + "px");
				}
			});
		}
	}

	function initResizer(resizerElt, chatElt) {
		var startX, startY, startWidth, startHeight;

		resizerElt.on("mousedown", initDrag);

		function doDrag(e) {
			chatElt.css("height", startHeight + startY - e.clientY + "px");
		}

		function stopDrag(e) {
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
	}

	exports.applyHeight = applyHeight;
	exports.initResizer = initResizer;
});
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