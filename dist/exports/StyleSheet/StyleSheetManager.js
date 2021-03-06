'use strict';

exports.__esModule = true;

var _createAtomicRules = require('./createAtomicRules');

var _createAtomicRules2 = _interopRequireDefault(_createAtomicRules);

var _hash = require('../../vendor/hash');

var _hash2 = _interopRequireDefault(_hash);

var _initialRules = require('./initialRules');

var _initialRules2 = _interopRequireDefault(_initialRules);

var _WebStyleSheet = require('./WebStyleSheet');

var _WebStyleSheet2 = _interopRequireDefault(_WebStyleSheet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Copyright (c) 2016-present, Nicolas Gallagher.
                                                                                                                                                           *
                                                                                                                                                           * This source code is licensed under the MIT license found in the
                                                                                                                                                           * LICENSE file in the root directory of this source tree.
                                                                                                                                                           *
                                                                                                                                                           * @noflow
                                                                                                                                                           */

var emptyObject = {};
var STYLE_ELEMENT_ID = 'react-native-stylesheet';

var createClassName = function createClassName(prop, value) {
  var hashed = (0, _hash2.default)(prop + normalizeValue(value));
  return process.env.NODE_ENV !== 'production' ? 'rn-' + prop + '-' + hashed : 'rn-' + hashed;
};

var normalizeValue = function normalizeValue(value) {
  return typeof value === 'object' ? JSON.stringify(value) : value;
};

var StyleSheetManager = function () {
  function StyleSheetManager() {
    var _this = this;

    _classCallCheck(this, StyleSheetManager);

    this._cache = {
      byClassName: {},
      byProp: {}
    };

    this._sheet = new _WebStyleSheet2.default(STYLE_ELEMENT_ID);
    _initialRules2.default.forEach(function (rule) {
      _this._sheet.insertRuleOnce(rule);
    });
  }

  StyleSheetManager.prototype.getClassName = function getClassName(prop, value) {
    var val = normalizeValue(value);
    var cache = this._cache.byProp;
    return cache[prop] && cache[prop].hasOwnProperty(val) && cache[prop][val];
  };

  StyleSheetManager.prototype.getDeclaration = function getDeclaration(className) {
    var cache = this._cache.byClassName;
    return cache[className] || emptyObject;
  };

  StyleSheetManager.prototype.getStyleSheet = function getStyleSheet() {
    var cssText = this._sheet.cssText;


    return {
      id: STYLE_ELEMENT_ID,
      textContent: cssText
    };
  };

  StyleSheetManager.prototype.injectDeclaration = function injectDeclaration(prop, value) {
    var _this2 = this;

    var val = normalizeValue(value);
    var className = this.getClassName(prop, val);
    if (!className) {
      className = createClassName(prop, val);
      this._addToCache(className, prop, val);
      var rules = (0, _createAtomicRules2.default)('.' + className, prop, value);
      rules.forEach(function (rule) {
        _this2._sheet.insertRuleOnce(rule);
      });
    }
    return className;
  };

  StyleSheetManager.prototype.injectKeyframe = function injectKeyframe() {
    // return identifier;
  };

  StyleSheetManager.prototype._addToCache = function _addToCache(className, prop, value) {
    var cache = this._cache;
    if (!cache.byProp[prop]) {
      cache.byProp[prop] = {};
    }
    cache.byProp[prop][value] = className;
    cache.byClassName[className] = { prop: prop, value: value };
  };

  return StyleSheetManager;
}();

exports.default = StyleSheetManager;