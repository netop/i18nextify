'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.missingHandler = missingHandler;

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _utils = require('i18next/dist/es/utils');

var _utils2 = require('./utils');

var utils = _interopRequireWildcard(_utils2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var missings = {};

function log() {
  _i18next2.default.services.logger.log('missing resources: \n' + JSON.stringify(missings, null, 2));
}

var debouncedLog = utils.debounce(log, 2000);

function missingHandler(lngs, namespace, key, res) {
  if (typeof lngs === 'string') lngs = [lngs];
  if (!lngs) lngs = [];

  lngs.forEach(function (lng) {
    (0, _utils.setPath)(missings, [lng, namespace, key], res);
    debouncedLog();
  });

  if (_i18next2.default.services.backendConnector && _i18next2.default.services.backendConnector.saveMissing) {
    _i18next2.default.services.backendConnector.saveMissing(lngs, namespace, key, res);
  }
}