'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _applyNativeMethods = require('../../modules/applyNativeMethods');

var _applyNativeMethods2 = _interopRequireDefault(_applyNativeMethods);

var _ColorPropType = require('../ColorPropType');

var _ColorPropType2 = _interopRequireDefault(_ColorPropType);

var _createElement = require('../createElement');

var _createElement2 = _interopRequireDefault(_createElement);

var _multiplyStyleLengthValue = require('../../modules/multiplyStyleLengthValue');

var _multiplyStyleLengthValue2 = _interopRequireDefault(_multiplyStyleLengthValue);

var _StyleSheet = require('../StyleSheet');

var _StyleSheet2 = _interopRequireDefault(_StyleSheet);

var _UIManager = require('../UIManager');

var _UIManager2 = _interopRequireDefault(_UIManager);

var _View = require('../View');

var _View2 = _interopRequireDefault(_View);

var _ViewPropTypes = require('../ViewPropTypes');

var _ViewPropTypes2 = _interopRequireDefault(_ViewPropTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2016-present, Nicolas Gallagher.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * This source code is licensed under the MIT license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * LICENSE file in the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @providesModule Switch
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var emptyObject = {};
var thumbDefaultBoxShadow = '0px 1px 3px rgba(0,0,0,0.5)';
var thumbFocusedBoxShadow = thumbDefaultBoxShadow + ', 0 0 0 10px rgba(0,0,0,0.1)';

var Switch = function (_Component) {
  _inherits(Switch, _Component);

  function Switch() {
    var _temp, _this, _ret;

    _classCallCheck(this, Switch);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this._handleChange = function (event) {
      var onValueChange = _this.props.onValueChange;

      onValueChange && onValueChange(event.nativeEvent.target.checked);
    }, _this._handleFocusState = function (event) {
      var isFocused = event.nativeEvent.type === 'focus';
      var boxShadow = isFocused ? thumbFocusedBoxShadow : thumbDefaultBoxShadow;
      if (_this._thumbElement) {
        _this._thumbElement.setNativeProps({ style: { boxShadow: boxShadow } });
      }
    }, _this._setCheckboxRef = function (element) {
      _this._checkboxElement = element;
    }, _this._setThumbRef = function (element) {
      _this._thumbElement = element;
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  Switch.prototype.blur = function blur() {
    _UIManager2.default.blur(this._checkboxElement);
  };

  Switch.prototype.focus = function focus() {
    _UIManager2.default.focus(this._checkboxElement);
  };

  Switch.prototype.render = function render() {
    var _props = this.props,
        activeThumbColor = _props.activeThumbColor,
        activeTrackColor = _props.activeTrackColor,
        disabled = _props.disabled,
        onValueChange = _props.onValueChange,
        style = _props.style,
        thumbColor = _props.thumbColor,
        trackColor = _props.trackColor,
        value = _props.value,
        onTintColor = _props.onTintColor,
        thumbTintColor = _props.thumbTintColor,
        tintColor = _props.tintColor,
        other = _objectWithoutProperties(_props, ['activeThumbColor', 'activeTrackColor', 'disabled', 'onValueChange', 'style', 'thumbColor', 'trackColor', 'value', 'onTintColor', 'thumbTintColor', 'tintColor']);

    var _StyleSheet$flatten = _StyleSheet2.default.flatten(style),
        styleHeight = _StyleSheet$flatten.height,
        styleWidth = _StyleSheet$flatten.width;

    var height = styleHeight || 20;
    var minWidth = (0, _multiplyStyleLengthValue2.default)(height, 2);
    var width = styleWidth > minWidth ? styleWidth : minWidth;
    var trackBorderRadius = (0, _multiplyStyleLengthValue2.default)(height, 0.5);
    var trackCurrentColor = value ? onTintColor || activeTrackColor : tintColor || trackColor;
    var thumbCurrentColor = value ? activeThumbColor : thumbTintColor || thumbColor;
    var thumbHeight = height;
    var thumbWidth = thumbHeight;

    var rootStyle = [styles.root, style, { height: height, width: width }, disabled && styles.cursorDefault];

    var trackStyle = [styles.track, {
      backgroundColor: trackCurrentColor,
      borderRadius: trackBorderRadius
    }, disabled && styles.disabledTrack];

    var thumbStyle = [styles.thumb, {
      backgroundColor: thumbCurrentColor,
      height: thumbHeight,
      width: thumbWidth
    }, disabled && styles.disabledThumb];

    var nativeControl = (0, _createElement2.default)('input', {
      checked: value,
      disabled: disabled,
      onBlur: this._handleFocusState,
      onChange: this._handleChange,
      onFocus: this._handleFocusState,
      ref: this._setCheckboxRef,
      style: [styles.nativeControl, styles.cursorInherit],
      type: 'checkbox'
    });

    return _react2.default.createElement(
      _View2.default,
      _extends({}, other, { style: rootStyle }),
      _react2.default.createElement(_View2.default, { style: trackStyle }),
      _react2.default.createElement(_View2.default, {
        ref: this._setThumbRef,
        style: [thumbStyle, value && styles.thumbOn, {
          marginStart: value ? (0, _multiplyStyleLengthValue2.default)(thumbWidth, -1) : 0
        }]
      }),
      nativeControl
    );
  };

  return Switch;
}(_react.Component);

Switch.displayName = 'Switch';
Switch.defaultProps = {
  activeThumbColor: '#009688',
  activeTrackColor: '#A3D3CF',
  disabled: false,
  style: emptyObject,
  thumbColor: '#FAFAFA',
  trackColor: '#939393',
  value: false
};
Switch.propTypes = process.env.NODE_ENV !== "production" ? Object.assign({}, _ViewPropTypes2.default, {
  activeThumbColor: _ColorPropType2.default,
  activeTrackColor: _ColorPropType2.default,
  disabled: _propTypes.bool,
  onValueChange: _propTypes.func,
  thumbColor: _ColorPropType2.default,
  trackColor: _ColorPropType2.default,
  value: _propTypes.bool,

  /* eslint-disable react/sort-prop-types */
  // Equivalent of 'activeTrackColor'
  onTintColor: _ColorPropType2.default,
  // Equivalent of 'thumbColor'
  thumbTintColor: _ColorPropType2.default,
  // Equivalent of 'trackColor'
  tintColor: _ColorPropType2.default
}) : {};


var styles = _StyleSheet2.default.create({
  root: {
    cursor: 'pointer',
    userSelect: 'none'
  },
  cursorDefault: {
    cursor: 'default'
  },
  cursorInherit: {
    cursor: 'inherit'
  },
  track: Object.assign({}, _StyleSheet2.default.absoluteFillObject, {
    height: '70%',
    margin: 'auto',
    transitionDuration: '0.1s',
    width: '100%'
  }),
  disabledTrack: {
    backgroundColor: '#D5D5D5'
  },
  thumb: {
    alignSelf: 'flex-start',
    borderRadius: '100%',
    boxShadow: thumbDefaultBoxShadow,
    start: '0%',
    transform: [{ translateZ: 0 }],
    transitionDuration: '0.1s'
  },
  thumbOn: {
    start: '100%'
  },
  disabledThumb: {
    backgroundColor: '#BDBDBD'
  },
  nativeControl: Object.assign({}, _StyleSheet2.default.absoluteFillObject, {
    height: '100%',
    margin: 0,
    opacity: 0,
    padding: 0,
    width: '100%'
  })
});

exports.default = (0, _applyNativeMethods2.default)(Switch);