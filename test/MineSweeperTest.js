'use strict';
const assert = require('power-assert');
const MineSweeper = require('..');

describe('MineSweeper', function(){
  describe('open', function(){
    it('should clear the field when all the cell opened', () => {
      const mine = new MineSweeper(1, 1, 0);
      assert.deepEqual(mine.open(0, 0), { status: 'CLEARED', field: [  [ 0 ] ] });
    });
    it('should return "already cleared" error when the target field is already cleared', () => {
      const mine = new MineSweeper(1, 1, 0);
      mine.open(0, 0);
      assert.deepEqual(mine.open(0, 0),
                       {
                         status: 'ERROR',
                         message: 'already cleared',
                         field: [  [ 0 ] ]
                       });
    });
  });
});
