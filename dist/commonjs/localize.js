'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = localize;

var _vdomToHtml = require('vdom-to-html');

var _vdomToHtml2 = _interopRequireDefault(_vdomToHtml);

var _vdomParser = require('vdom-parser');

var _vdomParser2 = _interopRequireDefault(_vdomParser);

var _vnode = require('virtual-dom/vnode/vnode');

var _vnode2 = _interopRequireDefault(_vnode);

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _utils = require('i18next/dist/es/utils');

var _utils2 = require('./utils');

var _Instrument = require('./Instrument');

var _Instrument2 = _interopRequireDefault(_Instrument);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isUnTranslated(node) {
  return !node.properties || !node.properties.attributes || node.properties.attributes.localized !== '';
}

function isNotExcluded(node) {
  var ret = !node.properties || !node.properties.attributes || node.properties.attributes.translated !== '';

  if (ret && node.tagName && _i18next2.default.options.ignoreTags.indexOf(node.tagName) > -1) ret = false;

  if (ret && _i18next2.default.options.ignoreClasses && node.properties && node.properties.className) {
    var p = node.properties.className.split(' ');
    p.forEach(function (cls) {
      if (!ret) return;
      if (_i18next2.default.options.ignoreClasses.indexOf(cls) > -1) ret = false;
    });
  }

  if (ret && _i18next2.default.options.ignoreIds) {
    if (_i18next2.default.options.ignoreIds.indexOf(node.properties && node.properties.id) > -1) ret = false;
  }

  return ret;
}

function translate(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var key = str.trim();
  if (!options.defaultValue) options.defaultValue = str;
  if (key) return _i18next2.default.t(key, options);
  return str;
}

var replaceInside = ['src', 'href'];
var REGEXP = new RegExp('%7B%7B(.+?)%7D%7D', 'g'); // urlEncoded {{}}
function translateProps(node, props) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (!props) return props;

  _i18next2.default.options.translateAttributes.forEach(function (item) {
    if (item.ele && node.tagName !== item.ele) return;
    if (item.cond && item.cond.length === 2) {
      var condValue = (0, _utils.getPath)(props, item.cond[0]) || (0, _utils.getPath)(props.attributes, item.cond[0]);
      if (!condValue || condValue !== item.cond[1]) return;
    }

    var wasOnAttr = false;
    var value = (0, _utils.getPath)(props, item.attr);
    if (!value) {
      value = (0, _utils.getPath)(props.attributes, item.attr);
      if (value) wasOnAttr = true;
    }
    if (value) (0, _utils.setPath)(wasOnAttr ? props.attributes : props, item.attr, translate(value, _extends({}, options)));
  });

  replaceInside.forEach(function (attr) {
    var value = (0, _utils.getPath)(props, attr);
    if (value) value = value.replace(/\{\{/g, '%7B%7B').replace(/\}\}/g, '%7D%7D'); // fix for safari
    if (value && value.indexOf('%7B') > -1) {
      var arr = [];

      value.split(REGEXP).reduce(function (mem, match, index) {
        if (match.length === 0) return mem;

        if (!index || index % 2 === 0) {
          mem.push(match);
        } else {
          mem.push(translate(match, _extends({}, options)));
        }
        return mem;
      }, arr);
      if (arr.length) (0, _utils.setPath)(props, attr, arr.join(''));
    }
  });

  return props;
}

function getTOptions(opts, node) {
  var optsOnNode = (0, _utils2.getAttribute)(node, 'i18next-options');
  if (optsOnNode) {
    try {
      optsOnNode = JSON.parse(optsOnNode);
    } catch (e) {
      console.warn('failed parsing options on node', node);
    }
  }
  if (optsOnNode && optsOnNode.inlineTags) optsOnNode.inlineTags = optsOnNode.inlineTags.map(function (s) {
    return s.toUpperCase();
  });

  return _extends({}, opts || {}, optsOnNode || {});
}

function removeIndent(str, substitution) {
  if (!_i18next2.default.options.cleanIndent) return str;

  var ret = str.replace(/\n +/g, substitution);
  return ret;
}

function canInline(node, tOptions) {
  if (!node.children || !node.children.length || _i18next2.default.options.ignoreInlineOn.indexOf(node.tagName) > -1) return false;
  if (_i18next2.default.options.mergeTags.indexOf(node.tagName) > -1) return true;

  var baseTags = tOptions.inlineTags || _i18next2.default.options.inlineTags;
  var inlineTags = tOptions.additionalInlineTags ? baseTags.concat(tOptions.additionalInlineTags) : baseTags;

  var inlineable = true;
  var hadNonTextNode = false;
  node.children.forEach(function (child) {
    if (!child.text && inlineTags.indexOf(child.tagName) < 0) inlineable = false;
    if (child.tagName) hadNonTextNode = true;
  });

  return inlineable && hadNonTextNode;
}

function walk(node, tOptions, parent) {
  var nodeIsNotExcluded = isNotExcluded(node);
  var nodeIsUnTranslated = isUnTranslated(node);
  tOptions = getTOptions(tOptions, node);

  // translate node as one block
  var mergeFlag = (0, _utils2.getAttribute)(node, 'merge');
  if (mergeFlag !== 'false' && (mergeFlag === '' || canInline(node, tOptions))) {
    if (nodeIsNotExcluded && nodeIsUnTranslated) {
      // wrap children into dummy node and remove that outer from translation
      var dummyNode = new _vnode2.default('I18NEXTIFYDUMMY', null, node.children);
      var key = removeIndent((0, _vdomToHtml2.default)(dummyNode), '').replace('<i18nextifydummy>', '').replace('</i18nextifydummy>', '');

      // translate that's children and surround it again with a dummy node to parse to vdom
      var translation = '<i18nextifydummy>' + translate(key, tOptions) + '</i18nextifydummy>';
      var newNode = (0, _vdomParser2.default)((translation || '').trim());

      // replace children on passed in node
      node.children = newNode.children;

      if (node.properties && node.properties.attributes) node.properties.attributes.localized = '';
    }

    return node;
  }

  if (node.children) {
    node.children.forEach(function (child) {
      if (nodeIsNotExcluded && nodeIsUnTranslated && child.text || !child.text && isNotExcluded(child)) {
        walk(child, tOptions, node);
      }
    });
  }

  // ignore comments
  if (node.text && !node.properties && node.type === 'Widget') return node;

  if (nodeIsNotExcluded && nodeIsUnTranslated) {
    if (node.text) {
      var match = void 0;
      var txt = node.text;

      // exclude whitespace replacement eg on PRE, CODE
      var ignore = _i18next2.default.options.ignoreCleanIndentFor.indexOf(parent.tagName) > -1;

      if (!ignore) {
        txt = removeIndent(node.text, '\n');
        if (_i18next2.default.options.cleanWhitespace) {
          var regex = /^\s*(.*[^\s])\s*$/g;
          match = regex.exec(txt);
        }
      }

      if (!ignore && match && match.length > 1 && _i18next2.default.options.cleanWhitespace) {
        var _translation = translate(match[1], tOptions);
        node.text = txt.replace(match[1], _translation);
      } else {
        node.text = translate(txt, tOptions);
      }
    }
    if (node.properties) node.properties = translateProps(node, node.properties, tOptions);
    if (node.properties && node.properties.attributes) node.properties.attributes.localized = '';
  }

  return node;
}

function localize(node) {
  var recurseTime = new _Instrument2.default();
  recurseTime.start();

  var localized = walk(node);

  _i18next2.default.services.logger.log('localization took: ' + recurseTime.end() + 'ms');

  return localized;
}