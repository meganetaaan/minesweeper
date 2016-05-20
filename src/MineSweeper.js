(function() {
  'use strict';

  // CONSTANTS
  const ROW_NUM = 8;
  const COL_NUM = 8;
  const MINE_NUM = 10;
  const STATUS = {
    OK: 'OK',
    ERROR: 'ERROR',
    CABOOM: 'CABOOM',
    CLEARED: 'CLEARED'
  }

  // private property
  const privateMap = new WeakMap();

  // private function
  function getPrivates(self) {
    let p = privateMap.get(self);
    if(!p) {
      p = {};
      privateMap.set(self, p);
    }
    return p;
  }

  function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min))
  }

  function select(arr, num) {
    if (arr.length < num) {
      throw new Error('number of selection exceeds array length');
    }
    const selectArr = [].concat(arr);
    const resultArr = [];
    for (let i = 0; i < num; i++) {
      resultArr.push(selectArr.splice(getRandomInt(0, selectArr.length), 1)[0]);
    }
    return resultArr;
  }

  //XXX: I/F to be extremely rewritten.
  class MineSweeper {
    constructor(rowNum, colNum, mineNum) {
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
    };

    createMineField(rowNum, colNum, mineNum) {
      if (mineNum >= rowNum * colNum) {
        throw new Error('too many mines!');
      }

      const field = [];
      const shuffleArr = [];

      // create a field
      for (let i = 0; i < rowNum; i++) {
        field[i] = [];
        for (let j = 0; j < colNum; j++) {
          field[i][j] = null;
          shuffleArr.push([i, j]);
        }
      }

      // fill mines
      const mineArr = select(shuffleArr, mineNum);
      for (const val of mineArr) {
        field[val[0]][val[1]] = -1;
      }

      return field;
    };

    createOpenField(rowNum, colNum) {
      const field = [];
      for (let i = 0; i < rowNum; i++) {
        field[i] = [];
        for (let j = 0; j < colNum; j++) {
          field[i][j] = false;
        }
      }

      return field;
    }

    open(row, col) {
      if(getPrivates(this).isCleared){
        return {
          status: STATUS.ERROR,
          message: 'already cleared',
          field: this.getAllField()
        };
      }
      if(getPrivates(this).isCaboomed){
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
      const ms = this.getMineState(row, col);
      if (ms === -1) {
        // TODO: make it Game-Over. Would be better to do it by a wrapper of this class.
        getPrivates(this).isCaboomed = true;
        return {
          status: STATUS.CABOOM,
          field: this.getAllField()
        };
      } else {
        if (ms === 0) {
          for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
              this.open(row + i, col + j);
            }
          }
        }
        const status =
          this.getRemainingCellNum() === this.mineNum
          ? STATUS.CLEARED
          : STATUS.OK;
        if(status === STATUS.CLEARED){
          getPrivates(this).isCleared = true;
        }
        return {
          status: status,
          field: this.getField()
        };
      }
    };

    getMineState(row, col) {
      const mineState = getPrivates(this).mineState;
      const state = mineState[row][col];
      if (state !== null) {
        return state;
      }
      let mineNum = 0;
      for (let i = -1; i < 2; i++) {
        if (row + i < 0 || row + i >= this.rowNum) {
          continue;
        }
        for (let j = -1; j < 2; j++) {
          if (col + j < 0 || col + j >= this.colNum) {
            continue;
          }
          mineNum += mineState[row + i][col + j] === -1;
        }
      }
      mineState[row][col] = mineNum;
      return mineNum;
    }

    getField() {
      return getPrivates(this).mineState.map((arr) => {
        return arr.map((val) => {
          return val === -1 ? null : val
        })
      });
    }

    getAllField() {
      return getPrivates(this).mineState;
    }

    getRemainingCellNum() {
      let result = 0;
      for(let i = 0; i < this.rowNum; i++){
        for(let j = 0; j < this.colNum; j++){
          result += !this.openState[i][j];
        }
      }
      return result;
    }
  };

  module.exports = MineSweeper;
})();
