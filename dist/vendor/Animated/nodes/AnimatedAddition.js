/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule AnimatedAddition
 * 
 * @format
 */
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AnimatedInterpolation = require('./AnimatedInterpolation');
var AnimatedNode = require('./AnimatedNode');
var AnimatedValue = require('./AnimatedValue');
var AnimatedWithChildren = require('./AnimatedWithChildren');

var AnimatedAddition = function (_AnimatedWithChildren) {
  _inherits(AnimatedAddition, _AnimatedWithChildren);

  function AnimatedAddition(a, b) {
    _classCallCheck(this, AnimatedAddition);

    var _this = _possibleConstructorReturn(this, _AnimatedWithChildren.call(this));

    _this._a = typeof a === 'number' ? new AnimatedValue(a) : a;
    _this._b = typeof b === 'number' ? new AnimatedValue(b) : b;
    return _this;
  }

  AnimatedAddition.prototype.__makeNative = function __makeNative() {
    this._a.__makeNative();
    this._b.__makeNative();
    _AnimatedWithChildren.prototype.__makeNative.call(this);
  };

  AnimatedAddition.prototype.__getValue = function __getValue() {
    return this._a.__getValue() + this._b.__getValue();
  };

  AnimatedAddition.prototype.interpolate = function interpolate(config) {
    return new AnimatedInterpolation(this, config);
  };

  AnimatedAddition.prototype.__attach = function __attach() {
    this._a.__addChild(this);
    this._b.__addChild(this);
  };

  AnimatedAddition.prototype.__detach = function __detach() {
    this._a.__removeChild(this);
    this._b.__removeChild(this);
    _AnimatedWithChildren.prototype.__detach.call(this);
  };

  AnimatedAddition.prototype.__getNativeConfig = function __getNativeConfig() {
    return {
      type: 'addition',
      input: [this._a.__getNativeTag(), this._b.__getNativeTag()]
    };
  };

  return AnimatedAddition;
}(AnimatedWithChildren);

module.exports = AnimatedAddition;