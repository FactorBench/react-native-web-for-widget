'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Batchinator = require('../Batchinator');

var _Batchinator2 = _interopRequireDefault(_Batchinator);

var _FillRateHelper = require('../FillRateHelper');

var _FillRateHelper2 = _interopRequireDefault(_FillRateHelper);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _RefreshControl = require('../../exports/RefreshControl');

var _RefreshControl2 = _interopRequireDefault(_RefreshControl);

var _ScrollView = require('../../exports/ScrollView');

var _ScrollView2 = _interopRequireDefault(_ScrollView);

var _StyleSheet = require('../../exports/StyleSheet');

var _StyleSheet2 = _interopRequireDefault(_StyleSheet);

var _UIManager = require('../../exports/UIManager');

var _UIManager2 = _interopRequireDefault(_UIManager);

var _View = require('../../exports/View');

var _View2 = _interopRequireDefault(_View);

var _ViewabilityHelper = require('../ViewabilityHelper');

var _ViewabilityHelper2 = _interopRequireDefault(_ViewabilityHelper);

var _VirtualizeUtils = require('../VirtualizeUtils');

var _findNodeHandle = require('../../exports/findNodeHandle');

var _infoLog = require('../infoLog');

var _infoLog2 = _interopRequireDefault(_infoLog);

var _invariant = require('fbjs/lib/invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _warning = require('fbjs/lib/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * This source code is licensed under the MIT license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * LICENSE file in the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @providesModule VirtualizedList
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @noflow
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var flattenStyle = _StyleSheet2.default.flatten;
var __DEV__ = process.env.NODE_ENV !== 'production';
/* $FlowFixMe - this Props seems to be missing a bunch of stuff. Remove this
 * comment to see the errors */


var _usedIndexForKey = false;

/**
 * Base implementation for the more convenient [`<FlatList>`](/react-native/docs/flatlist.html)
 * and [`<SectionList>`](/react-native/docs/sectionlist.html) components, which are also better
 * documented. In general, this should only really be used if you need more flexibility than
 * `FlatList` provides, e.g. for use with immutable data instead of plain arrays.
 *
 * Virtualization massively improves memory consumption and performance of large lists by
 * maintaining a finite render window of active items and replacing all items outside of the render
 * window with appropriately sized blank space. The window adapts to scrolling behavior, and items
 * are rendered incrementally with low-pri (after any running interactions) if they are far from the
 * visible area, or with hi-pri otherwise to minimize the potential of seeing blank space.
 *
 * Some caveats:
 *
 * - Internal state is not preserved when content scrolls out of the render window. Make sure all
 *   your data is captured in the item data or external stores like Flux, Redux, or Relay.
 * - This is a `PureComponent` which means that it will not re-render if `props` remain shallow-
 *   equal. Make sure that everything your `renderItem` function depends on is passed as a prop
 *   (e.g. `extraData`) that is not `===` after updates, otherwise your UI may not update on
 *   changes. This includes the `data` prop and parent component state.
 * - In order to constrain memory and enable smooth scrolling, content is rendered asynchronously
 *   offscreen. This means it's possible to scroll faster than the fill rate ands momentarily see
 *   blank content. This is a tradeoff that can be adjusted to suit the needs of each application,
 *   and we are working on improving it behind the scenes.
 * - By default, the list looks for a `key` prop on each item and uses that for the React key.
 *   Alternatively, you can provide a custom `keyExtractor` prop.
 *
 */
var VirtualizedList = function (_React$PureComponent) {
  _inherits(VirtualizedList, _React$PureComponent);

  // scrollToEnd may be janky without getItemLayout prop
  VirtualizedList.prototype.scrollToEnd = function scrollToEnd(params) {
    var animated = params ? params.animated : true;
    var veryLast = this.props.getItemCount(this.props.data) - 1;
    var frame = this._getFrameMetricsApprox(veryLast);
    var offset = Math.max(0, frame.offset + frame.length + this._footerLength - this._scrollMetrics.visibleLength);
    /* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This comment
     * suppresses an error when upgrading Flow's support for React. To see the
     * error delete this comment and run Flow. */
    this._scrollRef.scrollTo(
    /* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This
     * comment suppresses an error when upgrading Flow's support for React.
     * To see the error delete this comment and run Flow. */
    this.props.horizontal ? { x: offset, animated: animated } : { y: offset, animated: animated });
  };

  // scrollToIndex may be janky without getItemLayout prop


  VirtualizedList.prototype.scrollToIndex = function scrollToIndex(params) {
    var _props = this.props,
        data = _props.data,
        horizontal = _props.horizontal,
        getItemCount = _props.getItemCount,
        getItemLayout = _props.getItemLayout,
        onScrollToIndexFailed = _props.onScrollToIndexFailed;
    var animated = params.animated,
        index = params.index,
        viewOffset = params.viewOffset,
        viewPosition = params.viewPosition;

    (0, _invariant2.default)(index >= 0 && index < getItemCount(data), 'scrollToIndex out of range: ' + index + ' vs ' + (getItemCount(data) - 1));
    if (!getItemLayout && index > this._highestMeasuredFrameIndex) {
      (0, _invariant2.default)(!!onScrollToIndexFailed, 'scrollToIndex should be used in conjunction with getItemLayout or onScrollToIndexFailed, ' + 'otherwise there is no way to know the location of offscreen indices or handle failures.');
      onScrollToIndexFailed({
        averageItemLength: this._averageCellLength,
        highestMeasuredFrameIndex: this._highestMeasuredFrameIndex,
        index: index
      });
      return;
    }
    var frame = this._getFrameMetricsApprox(index);
    var offset = Math.max(0, frame.offset - (viewPosition || 0) * (this._scrollMetrics.visibleLength - frame.length)) - (viewOffset || 0);
    /* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This comment
     * suppresses an error when upgrading Flow's support for React. To see the
     * error delete this comment and run Flow. */
    this._scrollRef.scrollTo(
    /* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This
     * comment suppresses an error when upgrading Flow's support for React.
     * To see the error delete this comment and run Flow. */
    horizontal ? { x: offset, animated: animated } : { y: offset, animated: animated });
  };

  // scrollToItem may be janky without getItemLayout prop. Required linear scan through items -
  // use scrollToIndex instead if possible.


  VirtualizedList.prototype.scrollToItem = function scrollToItem(params) {
    var item = params.item;
    var _props2 = this.props,
        data = _props2.data,
        getItem = _props2.getItem,
        getItemCount = _props2.getItemCount;

    var itemCount = getItemCount(data);
    for (var _index = 0; _index < itemCount; _index++) {
      if (getItem(data, _index) === item) {
        this.scrollToIndex(Object.assign({}, params, { index: _index }));
        break;
      }
    }
  };

  /**
   * Scroll to a specific content pixel offset in the list.
   *
   * Param `offset` expects the offset to scroll to.
   * In case of `horizontal` is true, the offset is the x-value,
   * in any other case the offset is the y-value.
   *
   * Param `animated` (`true` by default) defines whether the list
   * should do an animation while scrolling.
   */


  VirtualizedList.prototype.scrollToOffset = function scrollToOffset(params) {
    var animated = params.animated,
        offset = params.offset;
    /* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This comment
     * suppresses an error when upgrading Flow's support for React. To see the
     * error delete this comment and run Flow. */

    this._scrollRef.scrollTo(
    /* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This
     * comment suppresses an error when upgrading Flow's support for React.
     * To see the error delete this comment and run Flow. */
    this.props.horizontal ? { x: offset, animated: animated } : { y: offset, animated: animated });
  };

  VirtualizedList.prototype.recordInteraction = function recordInteraction() {
    this._nestedChildLists.forEach(function (childList) {
      childList.ref && childList.ref.recordInteraction();
    });
    this._viewabilityTuples.forEach(function (t) {
      t.viewabilityHelper.recordInteraction();
    });
    this._updateViewableItems(this.props.data);
  };

  VirtualizedList.prototype.flashScrollIndicators = function flashScrollIndicators() {
    /* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This comment
     * suppresses an error when upgrading Flow's support for React. To see the
     * error delete this comment and run Flow. */
    this._scrollRef.flashScrollIndicators();
  };

  /**
   * Provides a handle to the underlying scroll responder.
   * Note that `this._scrollRef` might not be a `ScrollView`, so we
   * need to check that it responds to `getScrollResponder` before calling it.
   */


  VirtualizedList.prototype.getScrollResponder = function getScrollResponder() {
    if (this._scrollRef && this._scrollRef.getScrollResponder) {
      return this._scrollRef.getScrollResponder();
    }
  };

  VirtualizedList.prototype.getScrollableNode = function getScrollableNode() {
    if (this._scrollRef && this._scrollRef.getScrollableNode) {
      return this._scrollRef.getScrollableNode();
    } else {
      return (0, _findNodeHandle.findNodeHandle)(this._scrollRef);
    }
  };

  VirtualizedList.prototype.setNativeProps = function setNativeProps(props) {
    if (this._scrollRef) {
      this._scrollRef.setNativeProps(props);
    }
  };

  VirtualizedList.prototype.getChildContext = function getChildContext() {
    return {
      virtualizedList: {
        getScrollMetrics: this._getScrollMetrics,
        horizontal: this.props.horizontal,
        getOutermostParentListRef: this._getOutermostParentListRef,
        getNestedChildState: this._getNestedChildState,
        registerAsNestedChild: this._registerAsNestedChild,
        unregisterAsNestedChild: this._unregisterAsNestedChild
      }
    };
  };

  VirtualizedList.prototype._getCellKey = function _getCellKey() {
    return this.context.virtualizedCell && this.context.virtualizedCell.cellKey || 'rootList';
  };

  VirtualizedList.prototype.hasMore = function hasMore() {
    return this._hasMore;
  };

  function VirtualizedList(props, context) {
    _classCallCheck(this, VirtualizedList);

    var _this = _possibleConstructorReturn(this, _React$PureComponent.call(this, props, context));

    _initialiseProps.call(_this);

    (0, _invariant2.default)(!props.onScroll || !props.onScroll.__isNative, 'Components based on VirtualizedList must be wrapped with Animated.createAnimatedComponent ' + 'to support native onScroll events with useNativeDriver');

    (0, _invariant2.default)(props.windowSize > 0, 'VirtualizedList: The windowSize prop must be present and set to a value greater than 0.');

    _this._fillRateHelper = new _FillRateHelper2.default(_this._getFrameMetrics);
    _this._updateCellsToRenderBatcher = new _Batchinator2.default(_this._updateCellsToRender, _this.props.updateCellsBatchingPeriod);

    if (_this.props.viewabilityConfigCallbackPairs) {
      _this._viewabilityTuples = _this.props.viewabilityConfigCallbackPairs.map(function (pair) {
        return {
          viewabilityHelper: new _ViewabilityHelper2.default(pair.viewabilityConfig),
          onViewableItemsChanged: pair.onViewableItemsChanged
        };
      });
    } else if (_this.props.onViewableItemsChanged) {
      _this._viewabilityTuples.push({
        viewabilityHelper: new _ViewabilityHelper2.default(_this.props.viewabilityConfig),
        onViewableItemsChanged: _this.props.onViewableItemsChanged
      });
    }

    var initialState = {
      first: _this.props.initialScrollIndex || 0,
      last: Math.min(_this.props.getItemCount(_this.props.data), (_this.props.initialScrollIndex || 0) + _this.props.initialNumToRender) - 1
    };

    if (_this._isNestedWithSameOrientation()) {
      var storedState = _this.context.virtualizedList.getNestedChildState(_this.props.listKey || _this._getCellKey());
      if (storedState) {
        initialState = storedState;
        _this.state = storedState;
        _this._frames = storedState.frames;
      }
    }

    _this.state = initialState;
    return _this;
  }

  VirtualizedList.prototype.componentDidMount = function componentDidMount() {
    if (this._isNestedWithSameOrientation()) {
      this.context.virtualizedList.registerAsNestedChild({
        cellKey: this._getCellKey(),
        key: this.props.listKey || this._getCellKey(),
        ref: this
      });
    }
  };

  VirtualizedList.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this._isNestedWithSameOrientation()) {
      this.context.virtualizedList.unregisterAsNestedChild({
        key: this.props.listKey || this._getCellKey(),
        state: {
          first: this.state.first,
          last: this.state.last,
          frames: this._frames
        }
      });
    }
    this._updateViewableItems(null);
    this._updateCellsToRenderBatcher.dispose({ abort: true });
    this._viewabilityTuples.forEach(function (tuple) {
      tuple.viewabilityHelper.dispose();
    });
    this._fillRateHelper.deactivateAndFlush();
  };

  VirtualizedList.getDerivedStateFromProps = function getDerivedStateFromProps(newProps, prevState) {
    var data = newProps.data,
        extraData = newProps.extraData,
        getItemCount = newProps.getItemCount,
        maxToRenderPerBatch = newProps.maxToRenderPerBatch;
    // first and last could be stale (e.g. if a new, shorter items props is passed in), so we make
    // sure we're rendering a reasonable range here.

    return {
      first: Math.max(0, Math.min(prevState.first, getItemCount(data) - 1 - maxToRenderPerBatch)),
      last: Math.max(0, Math.min(prevState.last, getItemCount(data) - 1))
    };
  };

  // Workaround for React 16.2 which does not support static getDerivedStateFromProps.


  VirtualizedList.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    var state = this.constructor.getDerivedStateFromProps(nextProps, this.state);
    if (state !== null && state !== undefined) {
      this.setState(function () {
        return state;
      });
    }
  };

  VirtualizedList.prototype._pushCells = function _pushCells(cells, stickyHeaderIndices, stickyIndicesFromProps, first, last, inversionStyle) {
    var _this2 = this;

    var _props3 = this.props,
        CellRendererComponent = _props3.CellRendererComponent,
        ItemSeparatorComponent = _props3.ItemSeparatorComponent,
        data = _props3.data,
        getItem = _props3.getItem,
        getItemCount = _props3.getItemCount,
        horizontal = _props3.horizontal,
        keyExtractor = _props3.keyExtractor;

    var stickyOffset = this.props.ListHeaderComponent ? 1 : 0;
    var end = getItemCount(data) - 1;
    var prevCellKey = void 0;
    last = Math.min(end, last);

    var _loop = function _loop(ii) {
      var item = getItem(data, ii);
      var key = keyExtractor(item, ii);
      _this2._indicesToKeys.set(ii, key);
      if (stickyIndicesFromProps.has(ii + stickyOffset)) {
        stickyHeaderIndices.push(cells.length);
      }
      cells.push(_react2.default.createElement(CellRenderer, {
        CellRendererComponent: CellRendererComponent,
        ItemSeparatorComponent: ii < end ? ItemSeparatorComponent : undefined,
        cellKey: key,
        fillRateHelper: _this2._fillRateHelper,
        horizontal: horizontal,
        index: ii,
        inversionStyle: inversionStyle,
        item: item,
        key: key,
        prevCellKey: prevCellKey,
        onUpdateSeparators: _this2._onUpdateSeparators,
        onLayout: function onLayout(e) {
          return _this2._onCellLayout(e, key, ii);
        },
        onUnmount: _this2._onCellUnmount,
        parentProps: _this2.props,
        ref: function (_ref) {
          function ref(_x) {
            return _ref.apply(this, arguments);
          }

          ref.toString = function () {
            return _ref.toString();
          };

          return ref;
        }(function (ref) {
          _this2._cellRefs[key] = ref;
        })
      }));
      prevCellKey = key;
    };

    for (var ii = first; ii <= last; ii++) {
      _loop(ii);
    }
  };

  VirtualizedList.prototype._isVirtualizationDisabled = function _isVirtualizationDisabled() {
    return this.props.disableVirtualization;
  };

  VirtualizedList.prototype._isNestedWithSameOrientation = function _isNestedWithSameOrientation() {
    var nestedContext = this.context.virtualizedList;
    return !!(nestedContext && !!nestedContext.horizontal === !!this.props.horizontal);
  };

  VirtualizedList.prototype.render = function render() {
    if (__DEV__) {
      var flatStyles = flattenStyle(this.props.contentContainerStyle);
      (0, _warning2.default)(flatStyles == null || flatStyles.flexWrap !== 'wrap', '`flexWrap: `wrap`` is not supported with the `VirtualizedList` components.' + 'Consider using `numColumns` with `FlatList` instead.');
    }
    var _props4 = this.props,
        ListEmptyComponent = _props4.ListEmptyComponent,
        ListFooterComponent = _props4.ListFooterComponent,
        ListHeaderComponent = _props4.ListHeaderComponent;
    var _props5 = this.props,
        data = _props5.data,
        horizontal = _props5.horizontal;

    var isVirtualizationDisabled = this._isVirtualizationDisabled();
    var inversionStyle = this.props.inverted ? this.props.horizontal ? styles.horizontallyInverted : styles.verticallyInverted : null;
    var cells = [];
    var stickyIndicesFromProps = new Set(this.props.stickyHeaderIndices);
    var stickyHeaderIndices = [];
    if (ListHeaderComponent) {
      if (stickyIndicesFromProps.has(0)) {
        stickyHeaderIndices.push(0);
      }
      var element = _react2.default.isValidElement(ListHeaderComponent) ? ListHeaderComponent :
      // $FlowFixMe
      _react2.default.createElement(ListHeaderComponent, null);
      cells.push(_react2.default.createElement(
        VirtualizedCellWrapper,
        { cellKey: this._getCellKey() + '-header', key: '$header' },
        _react2.default.createElement(
          _View2.default,
          { onLayout: this._onLayoutHeader, style: inversionStyle },
          element
        )
      ));
    }
    var itemCount = this.props.getItemCount(data);
    if (itemCount > 0) {
      _usedIndexForKey = false;
      var spacerKey = !horizontal ? 'height' : 'width';
      var lastInitialIndex = this.props.initialScrollIndex ? -1 : this.props.initialNumToRender - 1;
      var _state = this.state,
          _first = _state.first,
          _last = _state.last;

      this._pushCells(cells, stickyHeaderIndices, stickyIndicesFromProps, 0, lastInitialIndex, inversionStyle);
      var firstAfterInitial = Math.max(lastInitialIndex + 1, _first);
      if (!isVirtualizationDisabled && _first > lastInitialIndex + 1) {
        var insertedStickySpacer = false;
        if (stickyIndicesFromProps.size > 0) {
          var stickyOffset = ListHeaderComponent ? 1 : 0;
          // See if there are any sticky headers in the virtualized space that we need to render.
          for (var ii = firstAfterInitial - 1; ii > lastInitialIndex; ii--) {
            if (stickyIndicesFromProps.has(ii + stickyOffset)) {
              var _ref2, _ref3;

              var initBlock = this._getFrameMetricsApprox(lastInitialIndex);
              var stickyBlock = this._getFrameMetricsApprox(ii);
              var leadSpace = stickyBlock.offset - (initBlock.offset + initBlock.length);
              cells.push(_react2.default.createElement(_View2.default, { key: '$sticky_lead', style: (_ref2 = {}, _ref2[spacerKey] = leadSpace, _ref2) }));
              this._pushCells(cells, stickyHeaderIndices, stickyIndicesFromProps, ii, ii, inversionStyle);
              var trailSpace = this._getFrameMetricsApprox(_first).offset - (stickyBlock.offset + stickyBlock.length);
              cells.push(_react2.default.createElement(_View2.default, { key: '$sticky_trail', style: (_ref3 = {}, _ref3[spacerKey] = trailSpace, _ref3) }));
              insertedStickySpacer = true;
              break;
            }
          }
        }
        if (!insertedStickySpacer) {
          var _ref4;

          var _initBlock = this._getFrameMetricsApprox(lastInitialIndex);
          var firstSpace = this._getFrameMetricsApprox(_first).offset - (_initBlock.offset + _initBlock.length);
          cells.push(_react2.default.createElement(_View2.default, { key: '$lead_spacer', style: (_ref4 = {}, _ref4[spacerKey] = firstSpace, _ref4) }));
        }
      }
      this._pushCells(cells, stickyHeaderIndices, stickyIndicesFromProps, firstAfterInitial, _last, inversionStyle);
      if (!this._hasWarned.keys && _usedIndexForKey) {
        console.warn('VirtualizedList: missing keys for items, make sure to specify a key property on each ' + 'item or provide a custom keyExtractor.');
        this._hasWarned.keys = true;
      }
      if (!isVirtualizationDisabled && _last < itemCount - 1) {
        var _ref5;

        var lastFrame = this._getFrameMetricsApprox(_last);
        // Without getItemLayout, we limit our tail spacer to the _highestMeasuredFrameIndex to
        // prevent the user for hyperscrolling into un-measured area because otherwise content will
        // likely jump around as it renders in above the viewport.
        var end = this.props.getItemLayout ? itemCount - 1 : Math.min(itemCount - 1, this._highestMeasuredFrameIndex);
        var endFrame = this._getFrameMetricsApprox(end);
        var tailSpacerLength = endFrame.offset + endFrame.length - (lastFrame.offset + lastFrame.length);
        cells.push(_react2.default.createElement(_View2.default, { key: '$tail_spacer', style: (_ref5 = {}, _ref5[spacerKey] = tailSpacerLength, _ref5) }));
      }
    } else if (ListEmptyComponent) {
      var _element = _react2.default.isValidElement(ListEmptyComponent) ? ListEmptyComponent :
      // $FlowFixMe
      _react2.default.createElement(ListEmptyComponent, null);
      cells.push(_react2.default.createElement(
        _View2.default,
        { key: '$empty', onLayout: this._onLayoutEmpty, style: inversionStyle },
        _element
      ));
    }
    if (ListFooterComponent) {
      var _element2 = _react2.default.isValidElement(ListFooterComponent) ? ListFooterComponent :
      // $FlowFixMe
      _react2.default.createElement(ListFooterComponent, null);
      cells.push(_react2.default.createElement(
        VirtualizedCellWrapper,
        { cellKey: this._getCellKey() + '-footer', key: '$footer' },
        _react2.default.createElement(
          _View2.default,
          { onLayout: this._onLayoutFooter, style: inversionStyle },
          _element2
        )
      ));
    }
    var scrollProps = Object.assign({}, this.props, {
      onContentSizeChange: this._onContentSizeChange,
      onLayout: this._onLayout,
      onScroll: this._onScroll,
      onScrollBeginDrag: this._onScrollBeginDrag,
      onScrollEndDrag: this._onScrollEndDrag,
      onMomentumScrollEnd: this._onMomentumScrollEnd,
      scrollEventThrottle: this.props.scrollEventThrottle, // TODO: Android support
      invertStickyHeaders: this.props.inverted,
      stickyHeaderIndices: stickyHeaderIndices
    });
    if (inversionStyle) {
      scrollProps.style = [inversionStyle, this.props.style];
    }

    this._hasMore = this.state.last < this.props.getItemCount(this.props.data) - 1;

    var ret = _react2.default.cloneElement((this.props.renderScrollComponent || this._defaultRenderScrollComponent)(scrollProps), {
      ref: this._captureScrollRef
    }, cells);
    if (this.props.debug) {
      return _react2.default.createElement(
        _View2.default,
        { style: { flex: 1 } },
        ret,
        this._renderDebugOverlay()
      );
    } else {
      return ret;
    }
  };

  VirtualizedList.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    var _props6 = this.props,
        data = _props6.data,
        extraData = _props6.extraData;

    if (data !== prevProps.data || extraData !== prevProps.extraData) {
      this._hasDataChangedSinceEndReached = true;

      // clear the viewableIndices cache to also trigger
      // the onViewableItemsChanged callback with the new data
      this._viewabilityTuples.forEach(function (tuple) {
        tuple.viewabilityHelper.resetViewableIndices();
      });
    }
    this._scheduleCellsToRenderUpdate();
  };
  // Maps a cell key to the set of keys for all outermost child lists within that cell


  VirtualizedList.prototype._computeBlankness = function _computeBlankness() {
    this._fillRateHelper.computeBlankness(this.props, this.state, this._scrollMetrics);
  };

  VirtualizedList.prototype._onCellLayout = function _onCellLayout(e, cellKey, index) {
    var layout = e.nativeEvent.layout;
    var next = {
      offset: this._selectOffset(layout),
      length: this._selectLength(layout),
      index: index,
      inLayout: true
    };
    var curr = this._frames[cellKey];
    if (!curr || next.offset !== curr.offset || next.length !== curr.length || index !== curr.index) {
      this._totalCellLength += next.length - (curr ? curr.length : 0);
      this._totalCellsMeasured += curr ? 0 : 1;
      this._averageCellLength = this._totalCellLength / this._totalCellsMeasured;
      this._frames[cellKey] = next;
      this._highestMeasuredFrameIndex = Math.max(this._highestMeasuredFrameIndex, index);
      this._scheduleCellsToRenderUpdate();
    } else {
      this._frames[cellKey].inLayout = true;
    }
    this._computeBlankness();
  };

  VirtualizedList.prototype._measureLayoutRelativeToContainingList = function _measureLayoutRelativeToContainingList() {
    var _this3 = this;

    _UIManager2.default.measureLayout((0, _findNodeHandle.findNodeHandle)(this), (0, _findNodeHandle.findNodeHandle)(this.context.virtualizedList.getOutermostParentListRef()), function (error) {
      console.warn("VirtualizedList: Encountered an error while measuring a list's" + ' offset from its containing VirtualizedList.');
    }, function (x, y, width, height) {
      _this3._offsetFromParentVirtualizedList = _this3._selectOffset({ x: x, y: y });
      _this3._scrollMetrics.contentLength = _this3._selectLength({ width: width, height: height });

      var scrollMetrics = _this3._convertParentScrollMetrics(_this3.context.virtualizedList.getScrollMetrics());
      _this3._scrollMetrics.visibleLength = scrollMetrics.visibleLength;
      _this3._scrollMetrics.offset = scrollMetrics.offset;
    });
  };

  VirtualizedList.prototype._renderDebugOverlay = function _renderDebugOverlay() {
    var normalize = this._scrollMetrics.visibleLength / this._scrollMetrics.contentLength;
    var framesInLayout = [];
    var itemCount = this.props.getItemCount(this.props.data);
    for (var ii = 0; ii < itemCount; ii++) {
      var frame = this._getFrameMetricsApprox(ii);
      if (frame.inLayout) {
        framesInLayout.push(frame);
      }
    }
    var windowTop = this._getFrameMetricsApprox(this.state.first).offset;
    var frameLast = this._getFrameMetricsApprox(this.state.last);
    var windowLen = frameLast.offset + frameLast.length - windowTop;
    var visTop = this._scrollMetrics.offset;
    var visLen = this._scrollMetrics.visibleLength;
    var baseStyle = { position: 'absolute', top: 0, right: 0 };
    return _react2.default.createElement(
      _View2.default,
      {
        style: Object.assign({}, baseStyle, {
          bottom: 0,
          width: 20,
          borderColor: 'blue',
          borderWidth: 1
        })
      },
      framesInLayout.map(function (f, ii) {
        return _react2.default.createElement(_View2.default, {
          key: 'f' + ii,
          style: Object.assign({}, baseStyle, {
            left: 0,
            top: f.offset * normalize,
            height: f.length * normalize,
            backgroundColor: 'orange'
          })
        });
      }),
      _react2.default.createElement(_View2.default, {
        style: Object.assign({}, baseStyle, {
          left: 0,
          top: windowTop * normalize,
          height: windowLen * normalize,
          borderColor: 'green',
          borderWidth: 2
        })
      }),
      _react2.default.createElement(_View2.default, {
        style: Object.assign({}, baseStyle, {
          left: 0,
          top: visTop * normalize,
          height: visLen * normalize,
          borderColor: 'red',
          borderWidth: 2
        })
      })
    );
  };

  VirtualizedList.prototype._selectLength = function _selectLength(metrics) {
    return !this.props.horizontal ? metrics.height : metrics.width;
  };

  VirtualizedList.prototype._selectOffset = function _selectOffset(metrics) {
    return !this.props.horizontal ? metrics.y : metrics.x;
  };

  VirtualizedList.prototype._maybeCallOnEndReached = function _maybeCallOnEndReached() {
    var _props7 = this.props,
        data = _props7.data,
        getItemCount = _props7.getItemCount,
        onEndReached = _props7.onEndReached,
        onEndReachedThreshold = _props7.onEndReachedThreshold;
    var _scrollMetrics = this._scrollMetrics,
        contentLength = _scrollMetrics.contentLength,
        visibleLength = _scrollMetrics.visibleLength,
        offset = _scrollMetrics.offset;

    var distanceFromEnd = contentLength - visibleLength - offset;
    if (onEndReached && this.state.last === getItemCount(data) - 1 &&
    /* $FlowFixMe(>=0.63.0 site=react_native_fb) This comment suppresses an
     * error found when Flow v0.63 was deployed. To see the error delete this
     * comment and run Flow. */
    distanceFromEnd < onEndReachedThreshold * visibleLength && (this._hasDataChangedSinceEndReached || this._scrollMetrics.contentLength !== this._sentEndForContentLength)) {
      // Only call onEndReached once for a given dataset + content length.
      this._hasDataChangedSinceEndReached = false;
      this._sentEndForContentLength = this._scrollMetrics.contentLength;
      onEndReached({ distanceFromEnd: distanceFromEnd });
    }
  };

  /* Translates metrics from a scroll event in a parent VirtualizedList into
   * coordinates relative to the child list.
   */


  VirtualizedList.prototype._scheduleCellsToRenderUpdate = function _scheduleCellsToRenderUpdate() {
    var _state2 = this.state,
        first = _state2.first,
        last = _state2.last;
    var _scrollMetrics2 = this._scrollMetrics,
        offset = _scrollMetrics2.offset,
        visibleLength = _scrollMetrics2.visibleLength,
        velocity = _scrollMetrics2.velocity;

    var itemCount = this.props.getItemCount(this.props.data);
    var hiPri = false;
    if (first > 0 || last < itemCount - 1) {
      var distTop = offset - this._getFrameMetricsApprox(first).offset;
      var distBottom = this._getFrameMetricsApprox(last).offset - (offset + visibleLength);
      var scrollingThreshold =
      /* $FlowFixMe(>=0.63.0 site=react_native_fb) This comment suppresses an
       * error found when Flow v0.63 was deployed. To see the error delete
       * this comment and run Flow. */
      this.props.onEndReachedThreshold * visibleLength / 2;
      hiPri = Math.min(distTop, distBottom) < 0 || velocity < -2 && distTop < scrollingThreshold || velocity > 2 && distBottom < scrollingThreshold;
    }
    // Only trigger high-priority updates if we've actually rendered cells,
    // and with that size estimate, accurately compute how many cells we should render.
    // Otherwise, it would just render as many cells as it can (of zero dimension),
    // each time through attempting to render more (limited by maxToRenderPerBatch),
    // starving the renderer from actually laying out the objects and computing _averageCellLength.
    if (hiPri && this._averageCellLength) {
      // Don't worry about interactions when scrolling quickly; focus on filling content as fast
      // as possible.
      this._updateCellsToRenderBatcher.dispose({ abort: true });
      this._updateCellsToRender();
      return;
    } else {
      this._updateCellsToRenderBatcher.schedule();
    }
  };

  VirtualizedList.prototype._updateViewableItems = function _updateViewableItems(data) {
    var _this4 = this;

    var getItemCount = this.props.getItemCount;


    this._viewabilityTuples.forEach(function (tuple) {
      tuple.viewabilityHelper.onUpdate(getItemCount(data), _this4._scrollMetrics.offset, _this4._scrollMetrics.visibleLength, _this4._getFrameMetrics, _this4._createViewToken, tuple.onViewableItemsChanged, _this4.state);
    });
  };

  return VirtualizedList;
}(_react2.default.PureComponent);

VirtualizedList.defaultProps = {
  disableVirtualization: false,
  horizontal: false,
  initialNumToRender: 10,
  keyExtractor: function keyExtractor(item, index) {
    if (item.key != null) {
      return item.key;
    }
    _usedIndexForKey = true;
    return String(index);
  },
  maxToRenderPerBatch: 10,
  onEndReachedThreshold: 2, // multiples of length
  scrollEventThrottle: 50,
  updateCellsBatchingPeriod: 50,
  windowSize: 21 // multiples of length
};
VirtualizedList.contextTypes = {
  virtualizedCell: _propTypes2.default.shape({
    cellKey: _propTypes2.default.string
  }),
  virtualizedList: _propTypes2.default.shape({
    getScrollMetrics: _propTypes2.default.func,
    horizontal: _propTypes2.default.bool,
    getOutermostParentListRef: _propTypes2.default.func,
    getNestedChildState: _propTypes2.default.func,
    registerAsNestedChild: _propTypes2.default.func,
    unregisterAsNestedChild: _propTypes2.default.func
  })
};
VirtualizedList.childContextTypes = {
  virtualizedList: _propTypes2.default.shape({
    getScrollMetrics: _propTypes2.default.func,
    horizontal: _propTypes2.default.bool,
    getOutermostParentListRef: _propTypes2.default.func,
    getNestedChildState: _propTypes2.default.func,
    registerAsNestedChild: _propTypes2.default.func,
    unregisterAsNestedChild: _propTypes2.default.func
  })
};

var _initialiseProps = function _initialiseProps() {
  var _this7 = this;

  this._getScrollMetrics = function () {
    return _this7._scrollMetrics;
  };

  this._getOutermostParentListRef = function () {
    if (_this7._isNestedWithSameOrientation()) {
      return _this7.context.virtualizedList.getOutermostParentListRef();
    } else {
      return _this7;
    }
  };

  this._getNestedChildState = function (key) {
    var existingChildData = _this7._nestedChildLists.get(key);
    return existingChildData && existingChildData.state;
  };

  this._registerAsNestedChild = function (childList) {
    // Register the mapping between this child key and the cellKey for its cell
    var childListsInCell = _this7._cellKeysToChildListKeys.get(childList.cellKey) || new Set();
    childListsInCell.add(childList.key);
    _this7._cellKeysToChildListKeys.set(childList.cellKey, childListsInCell);

    var existingChildData = _this7._nestedChildLists.get(childList.key);
    (0, _invariant2.default)(!(existingChildData && existingChildData.ref !== null), 'A VirtualizedList contains a cell which itself contains ' + 'more than one VirtualizedList of the same orientation as the parent ' + 'list. You must pass a unique listKey prop to each sibling list.');
    _this7._nestedChildLists.set(childList.key, {
      ref: childList.ref,
      state: null
    });

    if (_this7._hasInteracted) {
      childList.ref.recordInteraction();
    }
  };

  this._unregisterAsNestedChild = function (childList) {
    _this7._nestedChildLists.set(childList.key, {
      ref: null,
      state: childList.state
    });
  };

  this._onUpdateSeparators = function (keys, newProps) {
    keys.forEach(function (key) {
      var ref = key != null && _this7._cellRefs[key];
      ref && ref.updateSeparatorProps(newProps);
    });
  };

  this._averageCellLength = 0;
  this._cellKeysToChildListKeys = new Map();
  this._cellRefs = {};
  this._frames = {};
  this._footerLength = 0;
  this._hasDataChangedSinceEndReached = true;
  this._hasInteracted = false;
  this._hasMore = false;
  this._hasWarned = {};
  this._highestMeasuredFrameIndex = 0;
  this._headerLength = 0;
  this._indicesToKeys = new Map();
  this._hasDoneInitialScroll = false;
  this._nestedChildLists = new Map();
  this._offsetFromParentVirtualizedList = 0;
  this._prevParentOffset = 0;
  this._scrollMetrics = {
    contentLength: 0,
    dOffset: 0,
    dt: 10,
    offset: 0,
    timestamp: 0,
    velocity: 0,
    visibleLength: 0
  };
  this._scrollRef = null;
  this._sentEndForContentLength = 0;
  this._totalCellLength = 0;
  this._totalCellsMeasured = 0;
  this._viewabilityTuples = [];

  this._captureScrollRef = function (ref) {
    _this7._scrollRef = ref;
  };

  this._defaultRenderScrollComponent = function (props) {
    if (_this7._isNestedWithSameOrientation()) {
      return _react2.default.createElement(_View2.default, props);
    } else if (props.onRefresh) {
      (0, _invariant2.default)(typeof props.refreshing === 'boolean', '`refreshing` prop must be set as a boolean in order to use `onRefresh`, but got `' + JSON.stringify(props.refreshing) + '`');
      return _react2.default.createElement(_ScrollView2.default, _extends({}, props, {
        refreshControl:
        /* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This
         * comment suppresses an error when upgrading Flow's support for
         * React. To see the error delete this comment and run Flow. */
        _react2.default.createElement(_RefreshControl2.default, {
          refreshing: props.refreshing,
          onRefresh: props.onRefresh,
          progressViewOffset: props.progressViewOffset
        })
      }));
    } else {
      return _react2.default.createElement(_ScrollView2.default, props);
    }
  };

  this._onCellUnmount = function (cellKey) {
    var curr = _this7._frames[cellKey];
    if (curr) {
      _this7._frames[cellKey] = Object.assign({}, curr, { inLayout: false });
    }
  };

  this._onLayout = function (e) {
    if (_this7._isNestedWithSameOrientation()) {
      // Need to adjust our scroll metrics to be relative to our containing
      // VirtualizedList before we can make claims about list item viewability
      _this7._measureLayoutRelativeToContainingList();
    } else {
      _this7._scrollMetrics.visibleLength = _this7._selectLength(e.nativeEvent.layout);
    }
    _this7.props.onLayout && _this7.props.onLayout(e);
    _this7._scheduleCellsToRenderUpdate();
    _this7._maybeCallOnEndReached();
  };

  this._onLayoutEmpty = function (e) {
    _this7.props.onLayout && _this7.props.onLayout(e);
  };

  this._onLayoutFooter = function (e) {
    _this7._footerLength = _this7._selectLength(e.nativeEvent.layout);
  };

  this._onLayoutHeader = function (e) {
    _this7._headerLength = _this7._selectLength(e.nativeEvent.layout);
  };

  this._onContentSizeChange = function (width, height) {
    if (width > 0 && height > 0 && _this7.props.initialScrollIndex != null && _this7.props.initialScrollIndex > 0 && !_this7._hasDoneInitialScroll) {
      _this7.scrollToIndex({
        animated: false,
        index: _this7.props.initialScrollIndex
      });
      _this7._hasDoneInitialScroll = true;
    }
    if (_this7.props.onContentSizeChange) {
      _this7.props.onContentSizeChange(width, height);
    }
    _this7._scrollMetrics.contentLength = _this7._selectLength({ height: height, width: width });
    _this7._scheduleCellsToRenderUpdate();
    _this7._maybeCallOnEndReached();
  };

  this._convertParentScrollMetrics = function (metrics) {
    // Offset of the top of the nested list relative to the top of its parent's viewport
    var offset = metrics.offset - _this7._offsetFromParentVirtualizedList;
    // Child's visible length is the same as its parent's
    var visibleLength = metrics.visibleLength;
    var dOffset = offset - _this7._scrollMetrics.offset;
    var contentLength = _this7._scrollMetrics.contentLength;

    return {
      visibleLength: visibleLength,
      contentLength: contentLength,
      offset: offset,
      dOffset: dOffset
    };
  };

  this._onScroll = function (e) {
    _this7._nestedChildLists.forEach(function (childList) {
      childList.ref && childList.ref._onScroll(e);
    });
    if (_this7.props.onScroll) {
      _this7.props.onScroll(e);
    }
    var timestamp = e.timeStamp;
    var visibleLength = _this7._selectLength(e.nativeEvent.layoutMeasurement);
    var contentLength = _this7._selectLength(e.nativeEvent.contentSize);
    var offset = _this7._selectOffset(e.nativeEvent.contentOffset);
    var dOffset = offset - _this7._scrollMetrics.offset;

    if (_this7._isNestedWithSameOrientation()) {
      if (_this7._scrollMetrics.contentLength === 0) {
        // Ignore scroll events until onLayout has been called and we
        // know our offset from our offset from our parent
        return;
      }

      var _convertParentScrollM = _this7._convertParentScrollMetrics({
        visibleLength: visibleLength,
        offset: offset
      });

      visibleLength = _convertParentScrollM.visibleLength;
      contentLength = _convertParentScrollM.contentLength;
      offset = _convertParentScrollM.offset;
      dOffset = _convertParentScrollM.dOffset;
    }

    var dt = _this7._scrollMetrics.timestamp ? Math.max(1, timestamp - _this7._scrollMetrics.timestamp) : 1;
    var velocity = dOffset / dt;

    if (dt > 500 && _this7._scrollMetrics.dt > 500 && contentLength > 5 * visibleLength && !_this7._hasWarned.perf) {
      (0, _infoLog2.default)('VirtualizedList: You have a large list that is slow to update - make sure your ' + 'renderItem function renders components that follow React performance best practices ' + 'like PureComponent, shouldComponentUpdate, etc.', { dt: dt, prevDt: _this7._scrollMetrics.dt, contentLength: contentLength });
      _this7._hasWarned.perf = true;
    }
    _this7._scrollMetrics = {
      contentLength: contentLength,
      dt: dt,
      dOffset: dOffset,
      offset: offset,
      timestamp: timestamp,
      velocity: velocity,
      visibleLength: visibleLength
    };
    _this7._updateViewableItems(_this7.props.data);
    if (!_this7.props) {
      return;
    }
    _this7._maybeCallOnEndReached();
    if (velocity !== 0) {
      _this7._fillRateHelper.activate();
    }
    _this7._computeBlankness();
    _this7._scheduleCellsToRenderUpdate();
  };

  this._onScrollBeginDrag = function (e) {
    _this7._nestedChildLists.forEach(function (childList) {
      childList.ref && childList.ref._onScrollBeginDrag(e);
    });
    _this7._viewabilityTuples.forEach(function (tuple) {
      tuple.viewabilityHelper.recordInteraction();
    });
    _this7._hasInteracted = true;
    _this7.props.onScrollBeginDrag && _this7.props.onScrollBeginDrag(e);
  };

  this._onScrollEndDrag = function (e) {
    var velocity = e.nativeEvent.velocity;

    if (velocity) {
      _this7._scrollMetrics.velocity = _this7._selectOffset(velocity);
    }
    _this7._computeBlankness();
    _this7.props.onScrollEndDrag && _this7.props.onScrollEndDrag(e);
  };

  this._onMomentumScrollEnd = function (e) {
    _this7._scrollMetrics.velocity = 0;
    _this7._computeBlankness();
    _this7.props.onMomentumScrollEnd && _this7.props.onMomentumScrollEnd(e);
  };

  this._updateCellsToRender = function () {
    var _props9 = _this7.props,
        data = _props9.data,
        getItemCount = _props9.getItemCount,
        onEndReachedThreshold = _props9.onEndReachedThreshold;

    var isVirtualizationDisabled = _this7._isVirtualizationDisabled();
    _this7._updateViewableItems(data);
    if (!data) {
      return;
    }
    _this7.setState(function (state) {
      var newState = void 0;
      if (!isVirtualizationDisabled) {
        // If we run this with bogus data, we'll force-render window {first: 0, last: 0},
        // and wipe out the initialNumToRender rendered elements.
        // So let's wait until the scroll view metrics have been set up. And until then,
        // we will trust the initialNumToRender suggestion
        if (_this7._scrollMetrics.visibleLength) {
          // If we have a non-zero initialScrollIndex and run this before we've scrolled,
          // we'll wipe out the initialNumToRender rendered elements starting at initialScrollIndex.
          // So let's wait until we've scrolled the view to the right place. And until then,
          // we will trust the initialScrollIndex suggestion.
          if (!_this7.props.initialScrollIndex || _this7._scrollMetrics.offset) {
            newState = (0, _VirtualizeUtils.computeWindowedRenderLimits)(_this7.props, state, _this7._getFrameMetricsApprox, _this7._scrollMetrics);
          }
        }
      } else {
        var _scrollMetrics3 = _this7._scrollMetrics,
            contentLength = _scrollMetrics3.contentLength,
            _offset = _scrollMetrics3.offset,
            visibleLength = _scrollMetrics3.visibleLength;

        var _distanceFromEnd = contentLength - visibleLength - _offset;
        var renderAhead =
        /* $FlowFixMe(>=0.63.0 site=react_native_fb) This comment suppresses
         * an error found when Flow v0.63 was deployed. To see the error
         * delete this comment and run Flow. */
        _distanceFromEnd < onEndReachedThreshold * visibleLength ? _this7.props.maxToRenderPerBatch : 0;
        newState = {
          first: 0,
          last: Math.min(state.last + renderAhead, getItemCount(data) - 1)
        };
      }
      if (newState && _this7._nestedChildLists.size > 0) {
        var newFirst = newState.first;
        var newLast = newState.last;
        // If some cell in the new state has a child list in it, we should only render
        // up through that item, so that we give that list a chance to render.
        // Otherwise there's churn from multiple child lists mounting and un-mounting
        // their items.
        for (var ii = newFirst; ii <= newLast; ii++) {
          var cellKeyForIndex = _this7._indicesToKeys.get(ii);
          var childListKeys = cellKeyForIndex && _this7._cellKeysToChildListKeys.get(cellKeyForIndex);
          if (!childListKeys) {
            continue;
          }
          var someChildHasMore = false;
          // For each cell, need to check whether any child list in it has more elements to render
          for (var _iterator = childListKeys, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref6;

            if (_isArray) {
              if (_i >= _iterator.length) break;
              _ref6 = _iterator[_i++];
            } else {
              _i = _iterator.next();
              if (_i.done) break;
              _ref6 = _i.value;
            }

            var childKey = _ref6;

            var childList = _this7._nestedChildLists.get(childKey);
            if (childList && childList.ref && childList.ref.hasMore()) {
              someChildHasMore = true;
              break;
            }
          }
          if (someChildHasMore) {
            newState.last = ii;
            break;
          }
        }
      }
      return newState;
    });
  };

  this._createViewToken = function (index, isViewable) {
    var _props10 = _this7.props,
        data = _props10.data,
        getItem = _props10.getItem,
        keyExtractor = _props10.keyExtractor;

    var item = getItem(data, index);
    return { index: index, item: item, key: keyExtractor(item, index), isViewable: isViewable };
  };

  this._getFrameMetricsApprox = function (index) {
    var frame = _this7._getFrameMetrics(index);
    if (frame && frame.index === index) {
      // check for invalid frames due to row re-ordering
      return frame;
    } else {
      var _getItemLayout = _this7.props.getItemLayout;

      (0, _invariant2.default)(!_getItemLayout, 'Should not have to estimate frames when a measurement metrics function is provided');
      return {
        length: _this7._averageCellLength,
        offset: _this7._averageCellLength * index
      };
    }
  };

  this._getFrameMetrics = function (index) {
    var _props11 = _this7.props,
        data = _props11.data,
        getItem = _props11.getItem,
        getItemCount = _props11.getItemCount,
        getItemLayout = _props11.getItemLayout,
        keyExtractor = _props11.keyExtractor;

    (0, _invariant2.default)(getItemCount(data) > index, 'Tried to get frame for out of range index ' + index);
    var item = getItem(data, index);
    var frame = item && _this7._frames[keyExtractor(item, index)];
    if (!frame || frame.index !== index) {
      if (getItemLayout) {
        frame = getItemLayout(data, index);
        if (__DEV__) {
          var frameType = _propTypes2.default.shape({
            length: _propTypes2.default.number.isRequired,
            offset: _propTypes2.default.number.isRequired,
            index: _propTypes2.default.number.isRequired
          }).isRequired;
          _propTypes2.default.checkPropTypes({ frame: frameType }, { frame: frame }, 'frame', 'VirtualizedList.getItemLayout');
        }
      }
    }
    /* $FlowFixMe(>=0.63.0 site=react_native_fb) This comment suppresses an
     * error found when Flow v0.63 was deployed. To see the error delete this
     * comment and run Flow. */
    return frame;
  };
};

var CellRenderer = function (_React$Component) {
  _inherits(CellRenderer, _React$Component);

  function CellRenderer() {
    var _temp, _this5, _ret2;

    _classCallCheck(this, CellRenderer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret2 = (_temp = (_this5 = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this5), _this5.state = {
      separatorProps: {
        highlighted: false,
        leadingItem: _this5.props.item
      }
    }, _this5._separators = {
      highlight: function highlight() {
        var _this5$props = _this5.props,
            cellKey = _this5$props.cellKey,
            prevCellKey = _this5$props.prevCellKey;

        _this5.props.onUpdateSeparators([cellKey, prevCellKey], {
          highlighted: true
        });
      },
      unhighlight: function unhighlight() {
        var _this5$props2 = _this5.props,
            cellKey = _this5$props2.cellKey,
            prevCellKey = _this5$props2.prevCellKey;

        _this5.props.onUpdateSeparators([cellKey, prevCellKey], {
          highlighted: false
        });
      },
      updateProps: function updateProps(select, newProps) {
        var _this5$props3 = _this5.props,
            cellKey = _this5$props3.cellKey,
            prevCellKey = _this5$props3.prevCellKey;

        _this5.props.onUpdateSeparators([select === 'leading' ? prevCellKey : cellKey], newProps);
      }
    }, _temp), _possibleConstructorReturn(_this5, _ret2);
  }

  CellRenderer.prototype.getChildContext = function getChildContext() {
    return {
      virtualizedCell: {
        cellKey: this.props.cellKey
      }
    };
  };

  // TODO: consider factoring separator stuff out of VirtualizedList into FlatList since it's not
  // reused by SectionList and we can keep VirtualizedList simpler.


  CellRenderer.prototype.updateSeparatorProps = function updateSeparatorProps(newProps) {
    this.setState(function (state) {
      return {
        separatorProps: Object.assign({}, state.separatorProps, newProps)
      };
    });
  };

  CellRenderer.prototype.componentWillUnmount = function componentWillUnmount() {
    this.props.onUnmount(this.props.cellKey);
  };

  CellRenderer.prototype.render = function render() {
    var _props8 = this.props,
        CellRendererComponent = _props8.CellRendererComponent,
        ItemSeparatorComponent = _props8.ItemSeparatorComponent,
        fillRateHelper = _props8.fillRateHelper,
        horizontal = _props8.horizontal,
        item = _props8.item,
        index = _props8.index,
        inversionStyle = _props8.inversionStyle,
        parentProps = _props8.parentProps;
    var renderItem = parentProps.renderItem,
        getItemLayout = parentProps.getItemLayout;

    (0, _invariant2.default)(renderItem, 'no renderItem!');
    var element = renderItem({
      item: item,
      index: index,
      separators: this._separators
    });
    var onLayout = getItemLayout && !parentProps.debug && !fillRateHelper.enabled() ? undefined : this.props.onLayout;
    // NOTE: that when this is a sticky header, `onLayout` will get automatically extracted and
    // called explicitly by `ScrollViewStickyHeader`.
    var itemSeparator = ItemSeparatorComponent && _react2.default.createElement(ItemSeparatorComponent, this.state.separatorProps);
    var cellStyle = inversionStyle ? horizontal ? [{ flexDirection: 'row-reverse' }, inversionStyle] : [{ flexDirection: 'column-reverse' }, inversionStyle] : horizontal ? [{ flexDirection: 'row' }, inversionStyle] : inversionStyle;
    if (!CellRendererComponent) {
      return _react2.default.createElement(
        _View2.default,
        { style: cellStyle, onLayout: onLayout },
        element,
        itemSeparator
      );
    }
    return _react2.default.createElement(
      CellRendererComponent,
      _extends({}, this.props, { style: cellStyle, onLayout: onLayout }),
      element,
      itemSeparator
    );
  };

  return CellRenderer;
}(_react2.default.Component);

CellRenderer.childContextTypes = {
  virtualizedCell: _propTypes2.default.shape({
    cellKey: _propTypes2.default.string
  })
};

var VirtualizedCellWrapper = function (_React$Component2) {
  _inherits(VirtualizedCellWrapper, _React$Component2);

  function VirtualizedCellWrapper() {
    _classCallCheck(this, VirtualizedCellWrapper);

    return _possibleConstructorReturn(this, _React$Component2.apply(this, arguments));
  }

  VirtualizedCellWrapper.prototype.getChildContext = function getChildContext() {
    return {
      virtualizedCell: {
        cellKey: this.props.cellKey
      }
    };
  };

  VirtualizedCellWrapper.prototype.render = function render() {
    return this.props.children;
  };

  return VirtualizedCellWrapper;
}(_react2.default.Component);

VirtualizedCellWrapper.childContextTypes = {
  virtualizedCell: _propTypes2.default.shape({
    cellKey: _propTypes2.default.string
  })
};


var styles = _StyleSheet2.default.create({
  verticallyInverted: {
    transform: [{ scaleY: -1 }]
  },
  horizontallyInverted: {
    transform: [{ scaleX: -1 }]
  }
});

module.exports = VirtualizedList;