'use strict';

exports.__esModule = true;

var _invariant = require('fbjs/lib/invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _isEmpty = require('fbjs/lib/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _warning = require('fbjs/lib/warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* eslint-disable */
/**
 * Copyright (c) 2015, Facebook, Inc.  All rights reserved.
 *
 * Facebook, Inc. ("Facebook") owns all right, title and interest, including
 * all intellectual property and other proprietary rights, in and to the React
 * Native CustomComponents software (the "Software").  Subject to your
 * compliance with these terms, you are hereby granted a non-exclusive,
 * worldwide, royalty-free copyright license to (1) use and copy the Software;
 * and (2) reproduce and distribute the Software as part of your own software
 * ("Your Software").  Facebook reserves all rights not expressly granted to
 * you in this license agreement.
 *
 * THE SOFTWARE AND DOCUMENTATION, IF ANY, ARE PROVIDED "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES (INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE) ARE DISCLAIMED.
 * IN NO EVENT SHALL FACEBOOK OR ITS AFFILIATES, OFFICERS, DIRECTORS OR
 * EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @providesModule ListViewDataSource
 * @typechecks
 * 
 */

function defaultGetRowData(dataBlob, sectionID, rowID) {
  return dataBlob[sectionID][rowID];
}

function defaultGetSectionHeaderData(dataBlob, sectionID) {
  return dataBlob[sectionID];
}

/**
 * Provides efficient data processing and access to the
 * `ListView` component.  A `ListViewDataSource` is created with functions for
 * extracting data from the input blob, and comparing elements (with default
 * implementations for convenience).  The input blob can be as simple as an
 * array of strings, or an object with rows nested inside section objects.
 *
 * To update the data in the datasource, use `cloneWithRows` (or
 * `cloneWithRowsAndSections` if you care about sections).  The data in the
 * data source is immutable, so you can't modify it directly.  The clone methods
 * suck in the new data and compute a diff for each row so ListView knows
 * whether to re-render it or not.
 *
 * In this example, a component receives data in chunks, handled by
 * `_onDataArrived`, which concats the new data onto the old data and updates the
 * data source.  We use `concat` to create a new array - mutating `this._data`,
 * e.g. with `this._data.push(newRowData)`, would be an error. `_rowHasChanged`
 * understands the shape of the row data and knows how to efficiently compare
 * it.
 *
 * ```
 * getInitialState: function() {
 *   var ds = new ListViewDataSource({rowHasChanged: this._rowHasChanged});
 *   return {ds};
 * },
 * _onDataArrived(newData) {
 *   this._data = this._data.concat(newData);
 *   this.setState({
 *     ds: this.state.ds.cloneWithRows(this._data)
 *   });
 * }
 * ```
 */

var ListViewDataSource = function () {
  /**
   * You can provide custom extraction and `hasChanged` functions for section
   * headers and rows.  If absent, data will be extracted with the
   * `defaultGetRowData` and `defaultGetSectionHeaderData` functions.
   *
   * The default extractor expects data of one of the following forms:
   *
   *      { sectionID_1: { rowID_1: <rowData1>, ... }, ... }
   *
   *    or
   *
   *      { sectionID_1: [ <rowData1>, <rowData2>, ... ], ... }
   *
   *    or
   *
   *      [ [ <rowData1>, <rowData2>, ... ], ... ]
   *
   * The constructor takes in a params argument that can contain any of the
   * following:
   *
   * - getRowData(dataBlob, sectionID, rowID);
   * - getSectionHeaderData(dataBlob, sectionID);
   * - rowHasChanged(prevRowData, nextRowData);
   * - sectionHeaderHasChanged(prevSectionData, nextSectionData);
   */
  function ListViewDataSource(params) {
    _classCallCheck(this, ListViewDataSource);

    (0, _invariant2.default)(params && typeof params.rowHasChanged === 'function', 'Must provide a rowHasChanged function.');
    this._rowHasChanged = params.rowHasChanged;
    this._getRowData = params.getRowData || defaultGetRowData;
    this._sectionHeaderHasChanged = params.sectionHeaderHasChanged;
    this._getSectionHeaderData = params.getSectionHeaderData || defaultGetSectionHeaderData;

    this._dataBlob = null;
    this._dirtyRows = [];
    this._dirtySections = [];
    this._cachedRowCount = 0;

    // These two private variables are accessed by outsiders because ListView
    // uses them to iterate over the data in this class.
    this.rowIdentities = [];
    this.sectionIdentities = [];
  }

  /**
   * Clones this `ListViewDataSource` with the specified `dataBlob` and
   * `rowIdentities`. The `dataBlob` is just an arbitrary blob of data. At
   * construction an extractor to get the interesting information was defined
   * (or the default was used).
   *
   * The `rowIdentities` is is a 2D array of identifiers for rows.
   * ie. [['a1', 'a2'], ['b1', 'b2', 'b3'], ...].  If not provided, it's
   * assumed that the keys of the section data are the row identities.
   *
   * Note: This function does NOT clone the data in this data source. It simply
   * passes the functions defined at construction to a new data source with
   * the data specified. If you wish to maintain the existing data you must
   * handle merging of old and new data separately and then pass that into
   * this function as the `dataBlob`.
   */


  ListViewDataSource.prototype.cloneWithRows = function cloneWithRows(dataBlob, rowIdentities) {
    var rowIds = rowIdentities ? [rowIdentities] : null;
    if (!this._sectionHeaderHasChanged) {
      this._sectionHeaderHasChanged = function () {
        return false;
      };
    }
    return this.cloneWithRowsAndSections({ s1: dataBlob }, ['s1'], rowIds);
  };

  /**
   * This performs the same function as the `cloneWithRows` function but here
   * you also specify what your `sectionIdentities` are. If you don't care
   * about sections you should safely be able to use `cloneWithRows`.
   *
   * `sectionIdentities` is an array of identifiers for  sections.
   * ie. ['s1', 's2', ...].  If not provided, it's assumed that the
   * keys of dataBlob are the section identities.
   *
   * Note: this returns a new object!
   */


  ListViewDataSource.prototype.cloneWithRowsAndSections = function cloneWithRowsAndSections(dataBlob, sectionIdentities, rowIdentities) {
    (0, _invariant2.default)(typeof this._sectionHeaderHasChanged === 'function', 'Must provide a sectionHeaderHasChanged function with section data.');
    var newSource = new ListViewDataSource({
      getRowData: this._getRowData,
      getSectionHeaderData: this._getSectionHeaderData,
      rowHasChanged: this._rowHasChanged,
      sectionHeaderHasChanged: this._sectionHeaderHasChanged
    });
    newSource._dataBlob = dataBlob;
    if (sectionIdentities) {
      newSource.sectionIdentities = sectionIdentities;
    } else {
      newSource.sectionIdentities = Object.keys(dataBlob);
    }
    if (rowIdentities) {
      newSource.rowIdentities = rowIdentities;
    } else {
      newSource.rowIdentities = [];
      newSource.sectionIdentities.forEach(function (sectionID) {
        newSource.rowIdentities.push(Object.keys(dataBlob[sectionID]));
      });
    }
    newSource._cachedRowCount = countRows(newSource.rowIdentities);

    newSource._calculateDirtyArrays(this._dataBlob, this.sectionIdentities, this.rowIdentities);

    return newSource;
  };

  ListViewDataSource.prototype.getRowCount = function getRowCount() {
    return this._cachedRowCount;
  };

  ListViewDataSource.prototype.getRowAndSectionCount = function getRowAndSectionCount() {
    return this._cachedRowCount + this.sectionIdentities.length;
  };

  /**
   * Returns if the row is dirtied and needs to be rerendered
   */


  ListViewDataSource.prototype.rowShouldUpdate = function rowShouldUpdate(sectionIndex, rowIndex) {
    var needsUpdate = this._dirtyRows[sectionIndex][rowIndex];
    (0, _warning2.default)(needsUpdate !== undefined, 'missing dirtyBit for section, row: ' + sectionIndex + ', ' + rowIndex);
    return needsUpdate;
  };

  /**
   * Gets the data required to render the row.
   */


  ListViewDataSource.prototype.getRowData = function getRowData(sectionIndex, rowIndex) {
    var sectionID = this.sectionIdentities[sectionIndex];
    var rowID = this.rowIdentities[sectionIndex][rowIndex];
    (0, _warning2.default)(sectionID !== undefined && rowID !== undefined, 'rendering invalid section, row: ' + sectionIndex + ', ' + rowIndex);
    return this._getRowData(this._dataBlob, sectionID, rowID);
  };

  /**
   * Gets the rowID at index provided if the dataSource arrays were flattened,
   * or null of out of range indexes.
   */


  ListViewDataSource.prototype.getRowIDForFlatIndex = function getRowIDForFlatIndex(index) {
    var accessIndex = index;
    for (var ii = 0; ii < this.sectionIdentities.length; ii++) {
      if (accessIndex >= this.rowIdentities[ii].length) {
        accessIndex -= this.rowIdentities[ii].length;
      } else {
        return this.rowIdentities[ii][accessIndex];
      }
    }
    return null;
  };

  /**
   * Gets the sectionID at index provided if the dataSource arrays were flattened,
   * or null for out of range indexes.
   */


  ListViewDataSource.prototype.getSectionIDForFlatIndex = function getSectionIDForFlatIndex(index) {
    var accessIndex = index;
    for (var ii = 0; ii < this.sectionIdentities.length; ii++) {
      if (accessIndex >= this.rowIdentities[ii].length) {
        accessIndex -= this.rowIdentities[ii].length;
      } else {
        return this.sectionIdentities[ii];
      }
    }
    return null;
  };

  /**
   * Returns an array containing the number of rows in each section
   */


  ListViewDataSource.prototype.getSectionLengths = function getSectionLengths() {
    var results = [];
    for (var ii = 0; ii < this.sectionIdentities.length; ii++) {
      results.push(this.rowIdentities[ii].length);
    }
    return results;
  };

  /**
   * Returns if the section header is dirtied and needs to be rerendered
   */


  ListViewDataSource.prototype.sectionHeaderShouldUpdate = function sectionHeaderShouldUpdate(sectionIndex) {
    var needsUpdate = this._dirtySections[sectionIndex];
    (0, _warning2.default)(needsUpdate !== undefined, 'missing dirtyBit for section: ' + sectionIndex);
    return needsUpdate;
  };

  /**
   * Gets the data required to render the section header
   */


  ListViewDataSource.prototype.getSectionHeaderData = function getSectionHeaderData(sectionIndex) {
    if (!this._getSectionHeaderData) {
      return null;
    }
    var sectionID = this.sectionIdentities[sectionIndex];
    (0, _warning2.default)(sectionID !== undefined, 'renderSection called on invalid section: ' + sectionIndex);
    return this._getSectionHeaderData(this._dataBlob, sectionID);
  };

  /**
   * Private members and methods.
   */

  // These two 'protected' variables are accessed by ListView to iterate over
  // the data in this class.


  ListViewDataSource.prototype._calculateDirtyArrays = function _calculateDirtyArrays(prevDataBlob, prevSectionIDs, prevRowIDs) {
    // construct a hashmap of the existing (old) id arrays
    var prevSectionsHash = keyedDictionaryFromArray(prevSectionIDs);
    var prevRowsHash = {};
    for (var ii = 0; ii < prevRowIDs.length; ii++) {
      var sectionID = prevSectionIDs[ii];
      (0, _warning2.default)(!prevRowsHash[sectionID], 'SectionID appears more than once: ' + sectionID);
      prevRowsHash[sectionID] = keyedDictionaryFromArray(prevRowIDs[ii]);
    }

    // compare the 2 identity array and get the dirtied rows
    this._dirtySections = [];
    this._dirtyRows = [];

    var dirty;
    for (var sIndex = 0; sIndex < this.sectionIdentities.length; sIndex++) {
      var sectionID = this.sectionIdentities[sIndex];
      // dirty if the sectionHeader is new or _sectionHasChanged is true
      dirty = !prevSectionsHash[sectionID];
      var sectionHeaderHasChanged = this._sectionHeaderHasChanged;
      if (!dirty && sectionHeaderHasChanged) {
        dirty = sectionHeaderHasChanged(this._getSectionHeaderData(prevDataBlob, sectionID), this._getSectionHeaderData(this._dataBlob, sectionID));
      }
      this._dirtySections.push(!!dirty);

      this._dirtyRows[sIndex] = [];
      for (var rIndex = 0; rIndex < this.rowIdentities[sIndex].length; rIndex++) {
        var rowID = this.rowIdentities[sIndex][rIndex];
        // dirty if the section is new, row is new or _rowHasChanged is true
        dirty = !prevSectionsHash[sectionID] || !prevRowsHash[sectionID][rowID] || this._rowHasChanged(this._getRowData(prevDataBlob, sectionID, rowID), this._getRowData(this._dataBlob, sectionID, rowID));
        this._dirtyRows[sIndex].push(!!dirty);
      }
    }
  };

  return ListViewDataSource;
}();

function countRows(allRowIDs) {
  var totalRows = 0;
  for (var sectionIdx = 0; sectionIdx < allRowIDs.length; sectionIdx++) {
    var rowIDs = allRowIDs[sectionIdx];
    totalRows += rowIDs.length;
  }
  return totalRows;
}

function keyedDictionaryFromArray(arr) {
  if ((0, _isEmpty2.default)(arr)) {
    return {};
  }
  var result = {};
  for (var ii = 0; ii < arr.length; ii++) {
    var key = arr[ii];
    (0, _warning2.default)(!result[key], 'Value appears more than once in array: ' + key);
    result[key] = true;
  }
  return result;
}

exports.default = ListViewDataSource;