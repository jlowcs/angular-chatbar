var ngModule = angular.module('jlo-chatbar', []),
  _maxHeight, _height
;

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
  }
  
  this.chatId('id');
  
  this.maxHeight = function (val) {
    if (!angular.isFunction(val)) {
      if (val.match(/%$/)) {
        val = parseInt(val);
        _maxHeight = function (windowHeight) {
          return windowHeight * val / 100;
        };
        return ;
      }
      
      _maxHeight = function () {
        return val;
      };
      return ;
    }
    
    _maxHeight = val;
  }
  
  this.height = function (val) {
    if (!angular.isFunction(val)) {
      if (val.match(/%$/)) {
        val = parseInt(val);
        _height = function (windowHeight) {
          return windowHeight * val / 100;
        };
        return ;
      }
      
      _height = function () {
        return val;
      };
      return ;
    }
    
    _height = val;
  }
  
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
  }
});

function applyHeight(elt, height) {
  if (height && elt.length) {
    (!angular.isUndefined(height.maxHeight)) && elt.css('max-height', height.maxHeight + 'px');
    (!angular.isUndefined(height.minHeight)) && elt.css('min-height', height.minHeight + 'px');
    angular.forEach(elt, function(e){
      if (!angular.isUndefined(height.height) && !angular.element(e).data('jlo-chatbar-chat-resized')) {
        angular.element(e).css('height', height.height + 'px');
      }
    });
  }
}

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
      }
      
      this.minimize = function (chat) {
        chat.opened = false;
      }
      
      this.remove = function (chat) {
        jloChatbar.removeChat(chat.data);
      }
      
      this.height = {};
      
      if (_maxHeight || _height) {
        function onResize() {
          var windowHeight = $window.innerHeight;
          _this.height = {
            maxHeight: _maxHeight && _maxHeight(windowHeight),
            height: _height && _height(windowHeight)
          }
          applyHeight($element.find('jlo-chatbar-open'), _this.height)
        }
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
  }
});

function internalDirective(transcludeFnName, className, open) {
  return function ($scope, $element, $attrs, ctrl) {
    if (!ctrl[transcludeFnName]) {
      return ;
    }
    
    var transcludedScope,
      chat = $scope.$eval('chat'),
      elt
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
      }, 1)
    })
    
    $scope.$watch('chat', function (value) {
      chat = value;
      ctrl.chatVarName && (transcludedScope[ctrl.chatVarName] = chat.data);
    })
  }
}

ngModule.directive('jloChatbarMinimizedInternal', function() {
  return {
    require: '^^jloChatbar',
    restrict: 'AE',
    link: internalDirective('minimizedTransclude', 'jlo-chatbar__minimized')
  }
});

ngModule.directive('jloChatbarOpenInternal', function() {
  return {
    require: '^^jloChatbar',
    restrict: 'AE',
    link: internalDirective('openTransclude', 'jlo-chatbar__open', true)
  }
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
  }
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
  }
});

function initResizer(elt) {
  var p,
    startX, startY, startWidth, startHeight,
    resizerElt
  ;

  resizerElt = angular.element('<div class="jlo-chatbar__resizer"></div>');
  elt.after(resizerElt);
  elt.remove();
  resizerElt.on('mousedown', initDrag);
  
  p = resizerElt;
  
  do {
    p = p.parent();
  } while (p.length && p[0].tagName.toLowerCase() !== 'jlo-chatbar-open');
  
  if (!p.length) {
    throw new Error('jlo-chatbar-resizer must be inside jlo-chatbar-open');
  }
  
  function doDrag(e) {
    p.css('height', (startHeight + startY - e.clientY) + 'px');
  }
  
  function stopDrag(e) {
    angular.element(document.body)
    .removeClass('jlo-chatbar-noselect');
    angular.element(document)
    .off('mousemove', doDrag)
    .off('mouseup', stopDrag);
  }
  
  function initDrag(e) {
    p.data('jlo-chatbar-chat-resized', true);
    
    startY = e.clientY;
    startHeight = parseInt(document.defaultView.getComputedStyle(p[0]).height, 10);
    
    angular.element(document.body)
    .addClass('jlo-chatbar-noselect');
    angular.element(document)
    .on('mousemove', doDrag)
    .on('mouseup', stopDrag);
  }
}

ngModule.directive('jloChatbarResizer', function() {
  return {
    restrict: 'AE',
    transclude: 'element',
    link: function ($scope, $element) {
      initResizer($element);
    }
  }
});