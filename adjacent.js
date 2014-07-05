// Example game:
// 5a:0D,0,0,0RD,0DL,0U,0R,0DL,0U,0U,0D,0D,0UR,0L,0D,0UD,0U,1,0,0U,0UR,0L,0,0,5,

var _u = require('underscore');

var sampleGame =
  "5a:0D,0,0,0RD,0DL,0U,0R,0DL,0U,0U,0D,0D,0UR,0L,0D,0UD,0U,1,0,0U,0UR,0L,0,0,5,";

function parseElement(str, boardSize) {
  // Parse an element such as '0DL,' or '1U,'
  var matches = str.match(/(\d+)([DLRU]*)/);

  var nums = [parseInt(matches[1], 10)];

  if (nums[0] > boardSize) {
    throw new Error('cell value out of range');
  }

  if (nums[0] === 0) {
    nums = _u.range(1, boardSize + 1);
  }

  var adjacencies = matches[2].split('');

  return {num: nums, adj: adjacencies};
}

function isBoardConsistent(board){
  for (var row = 0; row < board.length; row++) {
    for (var col = 0; col < board.length; col++) {
      if (row < board.length-1) {
        // check consistency looking down
        if ((board[row]  [col].adj.indexOf('D') !== -1) ^
            (board[row+1][col].adj.indexOf('U') !== -1)) {
          return false;
        }
      }

      if (col < board.length-1) {
        // check consistency looking right
        if ((board[row][col]  .adj.indexOf('R') !== -1) ^
            (board[row][col+1].adj.indexOf('L') !== -1)) {
          return false;
        }
      }
    }
  }
  return true;
}

exports.parseGame = function(str) {
  var matches = str.match(/^(\d+)a:((\d+[DLRU]*,)+)$/);
  var boardSize;
  if (!matches || (boardSize = parseInt(matches[1])) < 2) {
    throw new Error('invalid adjacent board');
  }


  var elements = matches[2].split(',').slice(0, -1);

  if(elements.length !== (boardSize * boardSize)){
    throw new Error('incorrect number of cells');
  }

  var board = new Array(boardSize);
  for (var i = 0; i < board.length; i++) {
    board[i] = elements.slice(i*boardSize, (i+1)*boardSize).map(function(el) {
      return parseElement(el, boardSize);
    });
  }

  if (!isBoardConsistent(board)) {
    throw new Error('board adjacencies are inconsistent');
  }

  return board;
};
