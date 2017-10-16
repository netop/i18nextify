'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _i18next = require('i18next');

var _i18next2 = _interopRequireDefault(_i18next);

var _i18nextXhrBackend = require('i18next-xhr-backend');

var _i18nextXhrBackend2 = _interopRequireDefault(_i18nextXhrBackend);

var _i18nextBrowserLanguagedetector = require('i18next-browser-languagedetector');

var _i18nextBrowserLanguagedetector2 = _interopRequireDefault(_i18nextBrowserLanguagedetector);

var _Observer = require('./Observer');

var _Observer2 = _interopRequireDefault(_Observer);

var _docReady = require('./docReady');

var _docReady2 = _interopRequireDefault(_docReady);

var _renderer = require('./renderer');

var _renderer2 = _interopRequireDefault(_renderer);

var _missingHandler = require('./missingHandler');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDefaults() {
  return {
    autorun: true,
    ele: document.body,
    ignoreTags: ['SCRIPT'],
    ignoreIds: [],
    ignoreClasses: [],
    translateAttributes: ['placeholder', 'title', 'alt', 'value#input.type=button', 'value#input.type=submit'],
    mergeTags: [],
    inlineTags: [],
    ignoreInlineOn: [],
    cleanIndent: true,
    ignoreCleanIndentFor: ['PRE', 'CODE'],
    cleanWhitespace: true,
    nsSeparator: '#||#',
    keySeparator: '#|#',
    debug: window.location.search && window.location.search.indexOf('debug=true') > -1,
    saveMissing: window.location.search && window.location.search.indexOf('saveMissing=true') > -1,
    namespace: false,
    namespaceFromPath: false,
    missingKeyHandler: _missingHandler.missingHandler,
    ns: [],
    classNameOnInitialTranslate: "i18nextify-loaded",
    onInitialTranslate: function onInitialTranslate(callback) {
      callback();
    }
  };
}

// auto initialize on dom ready
var domReady = false;
var initialized = false;
(0, _docReady2.default)(function () {
  domReady = true;
  if (!initialized) init();
});

// extend i18next with default extensions
_i18next2.default.use(_i18nextXhrBackend2.default);
_i18next2.default.use(_i18nextBrowserLanguagedetector2.default);

// log out missings
// i18next.on('missingKey', missingHandler);

// store last init options - for case init is called before dom ready
var lastOptions = {};

function getPathname() {
  var path = location.pathname;
  if (path === '/') return 'root';

  var parts = path.split('/');
  var ret = 'root';

  parts.forEach(function (p) {
    if (p) ret += '_' + p;
  });

  return ret;
}

function changeNamespace(ns) {
  if (!ns && lastOptions.namespaceFromPath) ns = getPathname();
  lastOptions.ns.push(ns);
  lastOptions.defaultNS = ns;

  _i18next2.default.loadNamespaces(lastOptions.ns, function () {
    _i18next2.default.setDefaultNamespace(ns);
  });
}

function init() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  options = _extends({}, getDefaults(), lastOptions, options);

  if (options.namespace) {
    options.ns.push(options.namespace);
    options.defaultNS = options.namespace;
  } else if (options.namespaceFromPath) {
    var ns = getPathname();
    options.ns.push(ns);
    options.defaultNS = ns;
  }

  if (!options.ns.length) options.ns = ['translation'];

  // delay init from domReady
  if (!options.ele) {
    delete options.ele;
    lastOptions = options;
  }

  if (options.ignoreTags) options.ignoreTags = options.ignoreTags.map(function (s) {
    return s.toUpperCase();
  });
  if (options.ignoreCleanIndentFor) options.ignoreCleanIndentFor = options.ignoreCleanIndentFor.map(function (s) {
    return s.toUpperCase();
  });
  if (options.inlineTags) options.inlineTags = options.inlineTags.map(function (s) {
    return s.toUpperCase();
  });
  if (options.ignoreInlineOn) options.ignoreInlineOn = options.ignoreInlineOn.map(function (s) {
    return s.toUpperCase();
  });
  if (options.mergeTags) options.mergeTags = options.mergeTags.map(function (s) {
    return s.toUpperCase();
  });
  options.translateAttributes = options.translateAttributes.reduce(function (mem, attr) {
    var res = { attr: attr };
    if (attr.indexOf('#') > -1) {
      var _attr$split = attr.split('#'),
          _attr$split2 = _slicedToArray(_attr$split, 2),
          a = _attr$split2[0],
          c = _attr$split2[1];

      res.attr = a;
      if (c.indexOf('.') > -1) {
        var _c$split = c.split('.'),
            _c$split2 = _slicedToArray(_c$split, 2),
            e = _c$split2[0],
            b = _c$split2[1];

        res.ele = e.toUpperCase();
        res.cond = b.toLowerCase().split('=');
      } else if (c.indexOf('=') > -1) {
        res.cond = c.toLowerCase().split('=');
      } else {
        res.ele = c.toUpperCase();
      }
    }
    mem.push(res);
    return mem;
  }, []);

  initialized = true;
  var renderers = [];

  var observer = void 0;

  function addRenderers(children) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (options.ignoreTags.indexOf(c.tagName) < 0 && options.ignoreIds.indexOf(c.id) < 0 && options.ignoreClasses.indexOf(c.className) < 0 && !c.attributes.localized && !c.attributes.translated) {
        var r = (0, _renderer2.default)(c, observer);
        renderers.push(r);
        r.render();
      }
    }
  }

  function waitForInitialRender(children, timeout, callback) {
    var allRendered = true;
    setTimeout(function () {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (options.ignoreTags.indexOf(c.tagName) < 0 && options.ignoreIds.indexOf(c.id) < 0 && options.ignoreClasses.indexOf(c.className) < 0 && !c.attributes.localized && !c.attributes.translated) {
          if (allRendered) waitForInitialRender(children, 100, callback);
          allRendered = false;
          break;
        }
      }

      if (allRendered) callback();
    }, timeout);
  }

  var todo = 1;
  if (!domReady) todo++;
  if (options.autorun === false) todo++;

  function done() {
    todo = todo - 1;
    if (!todo) {
      if (!options.ele) options.ele = document.body;
      var children = options.ele.children;

      observer = new _Observer2.default(options.ele);
      addRenderers(children);

      observer.on('changed', function (mutations) {
        renderers.forEach(function (r) {
          return r.debouncedRender();
        });
        addRenderers(children);
      });

      waitForInitialRender(children, 0, function () {
        options.onInitialTranslate(function () {
          options.ele.className += " " + options.classNameOnInitialTranslate;
        });
      });
    }
  }

  _i18next2.default.init(options, done);

  if (!domReady) {
    (0, _docReady2.default)(done);
  }
  if (options.autorun === false) return { start: done };
}

exports.default = {
  init: init,
  i18next: _i18next2.default,
  changeNamespace: changeNamespace
};