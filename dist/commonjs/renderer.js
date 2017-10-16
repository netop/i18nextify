'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (root, observer) {
  var ret = {};
  ret.render = function render() {
    var newNode = createVdom(root);
    var localized = (0, _localize2.default)((0, _udc2.default)(newNode));

    var patches = (0, _diff2.default)(newNode, localized);
    if (patches['0']) observer.reset(); // reset observer if having patches
    root = (0, _patch2.default)(root, patches);
  };

  ret.debouncedRender = utils.debounce(ret.render, 200);

  return ret;
};

var _vdomVirtualize = require('vdom-virtualize');

var _vdomVirtualize2 = _interopRequireDefault(_vdomVirtualize);

var _diff = require('virtual-dom/diff');

var _diff2 = _interopRequireDefault(_diff);

var _patch = require('virtual-dom/patch');

var _patch2 = _interopRequireDefault(_patch);

var _udc = require('udc');

var _udc2 = _interopRequireDefault(_udc);

var _Instrument = require('./Instrument');

var _Instrument2 = _interopRequireDefault(_Instrument);

var _localize = require('./localize');

var _localize2 = _interopRequireDefault(_localize);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createVdom(node) {
  var virtualizeTime = new _Instrument2.default();
  virtualizeTime.start();

  var vNode = (0, _vdomVirtualize2.default)(node);

  _i18next2.default.services.logger.log('virtualization took: ' + virtualizeTime.end() + 'ms');
  return vNode;
}