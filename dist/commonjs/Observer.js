'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventEmitter2 = require('i18next/dist/es/EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Observer = function (_EventEmitter) {
  _inherits(Observer, _EventEmitter);

  function Observer(ele) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Observer);

    var _this = _possibleConstructorReturn(this, (Observer.__proto__ || Object.getPrototypeOf(Observer)).call(this));

    _this.ele = ele;
    _this.options = options;
    _this.observer = _this.create();
    _this.internalChange = true;
    return _this;
  }

  _createClass(Observer, [{
    key: 'create',
    value: function create() {
      var _this2 = this;

      var lastToggleTimeout = void 0;
      var toggleInternal = function toggleInternal() {
        if (lastToggleTimeout) window.clearTimeout(lastToggleTimeout);

        lastToggleTimeout = setTimeout(function () {
          if (_this2.internalChange) _this2.internalChange = false;
        }, 200);
      };

      var observer = new MutationObserver(function (mutations) {
        // For the sake of...observation...let's output the mutation to console to see how this all works
        // mutations.forEach(function(mutation) {
        // 	console.log(mutation.type);
        // });
        if (_this2.internalChange) toggleInternal();
        if (!_this2.internalChange) _this2.emit('changed', mutations);
      });

      // Notify me of everything!
      var observerConfig = {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      };

      // Node, config
      // In this case we'll listen to all changes to body and child nodes
      observer.observe(this.ele, observerConfig);

      return observer;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.internalChange = true;
    }
  }]);

  return Observer;
}(_EventEmitter3.default);

exports.default = Observer;