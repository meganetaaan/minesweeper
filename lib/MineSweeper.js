'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  'use strict';

  // CONSTANTS

  var ROW_NUM = 8;
  var COL_NUM = 8;
  var MINE_NUM = 10;
  var STATUS = {
    OK: 'OK',
    ERROR: 'ERROR',
    CABOOM: 'CABOOM',
    CLEARED: 'CLEARED'
  };

  // private property
  var privateMap = new WeakMap();

  // private function
  function getPrivates(self) {
    var p = privateMap.get(self);
    if (!p) {
      p = {};
      privateMap.set(self, p);
    }
    return p;
  }

  function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  }

  function select(arr, num) {
    if (arr.length < num) {
      throw new Error('number of selection exceeds array length');
    }
    var selectArr = [].concat(arr);
    var resultArr = [];
    for (var i = 0; i < num; i++) {
      resultArr.push(selectArr.splice(getRandomInt(0, selectArr.length), 1)[0]);
    }
    return resultArr;
  }

  //XXX: I/F to be extremely rewritten.

  var MineSweeper = function () {
    function MineSweeper(rowNum, colNum, mineNum) {
      _classCallCheck(this, MineSweeper);

      if (typeof rowNum === 'undefined') {
        rowNum = ROW_NUM;
      }
      if (typeof colNum === 'undefined') {
        colNum = COL_NUM;
      }
      if (typeof mineNum === 'undefined') {
        mineNum = MINE_NUM;
      }

      //TODO: define Field class to concealing the mine position,
      // lazy evaluation and row/col validation.
      this.openState = this.createOpenField(rowNum, colNum);
      this.rowNum = rowNum;
      this.colNum = colNum;
      this.mineNum = mineNum;

      getPrivates(this).mineState = this.createMineField(rowNum, colNum, mineNum);
      getPrivates(this).isCaboomed = false;
      getPrivates(this).isCleared = false;
    }

    _createClass(MineSweeper, [{
      key: 'createMineField',
      value: function createMineField(rowNum, colNum, mineNum) {
        if (mineNum >= rowNum * colNum) {
          throw new Error('too many mines!');
        }

        var field = [];
        var shuffleArr = [];

        // create a field
        for (var i = 0; i < rowNum; i++) {
          field[i] = [];
          for (var j = 0; j < colNum; j++) {
            field[i][j] = null;
            shuffleArr.push([i, j]);
          }
        }

        // fill mines
        var mineArr = select(shuffleArr, mineNum);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = mineArr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var val = _step.value;

            field[val[0]][val[1]] = -1;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return field;
      }
    }, {
      key: 'createOpenField',
      value: function createOpenField(rowNum, colNum) {
        var field = [];
        for (var i = 0; i < rowNum; i++) {
          field[i] = [];
          for (var j = 0; j < colNum; j++) {
            field[i][j] = false;
          }
        }

        return field;
      }
    }, {
      key: 'open',
      value: function open(row, col) {
        if (getPrivates(this).isCleared) {
          return {
            status: STATUS.ERROR,
            message: 'already cleared',
            field: this.getAllField()
          };
        }
        if (getPrivates(this).isCaboomed) {
          return {
            status: STATUS.ERROR,
            message: 'already caboomed',
            field: this.getAllField()
          };
        }
        if (row < 0 || row >= this.rowNum || col < 0 || col >= this.colNum) {
          return {
            status: STATUS.ERROR,
            message: 'out of field',
            field: this.getField()
          };
        }
        if (this.openState[row][col]) {
          return {
            status: STATUS.ERROR,
            message: 'already opened',
            field: this.getField()
          };
        }

        this.openState[row][col] = true;
        var ms = this.getMineState(row, col);
        if (ms === -1) {
          // TODO: make it Game-Over. Would be better to do it by a wrapper of this class.
          getPrivates(this).isCaboomed = true;
          return {
            status: STATUS.CABOOM,
            field: this.getAllField()
          };
        } else {
          if (ms === 0) {
            for (var i = -1; i < 2; i++) {
              for (var j = -1; j < 2; j++) {
                this.open(row + i, col + j);
              }
            }
          }
          var status = this.getRemainingCellNum() === this.mineNum ? STATUS.CLEARED : STATUS.OK;
          if (status === STATUS.CLEARED) {
            getPrivates(this).isCleared = true;
          }
          return {
            status: status,
            field: this.getField()
          };
        }
      }
    }, {
      key: 'getMineState',
      value: function getMineState(row, col) {
        var mineState = getPrivates(this).mineState;
        var state = mineState[row][col];
        if (state !== null) {
          return state;
        }
        var mineNum = 0;
        for (var i = -1; i < 2; i++) {
          if (row + i < 0 || row + i >= this.rowNum) {
            continue;
          }
          for (var j = -1; j < 2; j++) {
            if (col + j < 0 || col + j >= this.colNum) {
              continue;
            }
            mineNum += mineState[row + i][col + j] === -1;
          }
        }
        mineState[row][col] = mineNum;
        return mineNum;
      }
    }, {
      key: 'getField',
      value: function getField() {
        return getPrivates(this).mineState.map(function (arr) {
          return arr.map(function (val) {
            return val === -1 ? null : val;
          });
        });
      }
    }, {
      key: 'getRemainingCellNum',
      value: function getRemainingCellNum() {
        var result = 0;
        for (var i = 0; i < this.rowNum; i++) {
          for (var j = 0; j < this.colNum; j++) {
            result += !this.openState[i][j];
          }
        }
        console.log('getRemainingCellNum: ' + result);
        return result;
      }
    }, {
      key: 'getAllField',
      value: function getAllField() {
        return getPrivates(this).mineState;
      }
    }]);

    return MineSweeper;
  }();

  ;

  module.exports = MineSweeper;
})();