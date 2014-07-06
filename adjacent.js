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

function printBoard(board) {
  for (var row = 0; row < board.length; row++) {
    var str = ['', ''];
    for (var col = 0; col < board.length; col++) {
      if (board[row][col].num.length > 1) {
        str[0] += '·';
      } else {
        str[0] += board[row][col].num[0];
      }
      str[0] += (~board[row][col].adj.indexOf('R') ? '|' : ' ');
      str[1] += (~board[row][col].adj.indexOf('D') ? '—' : ' ') + ' ';
    }
    console.log(str[0]);
    if (row < board.length-1) {
      console.log(str[1]);
    }
  }
}

// Returns the universe of possible cell values in a board of the given size.
function universe(size) {
  return _u.range(1, size+1);
}

// Return a list of the numbers adjacent to num, in a board of size size.
function adjacencies(num, size) {
  return _u.intersection([num-1, num+1], universe(size));
}

// Return a list of the numbers neither adjacent nor equal to num, in a
// board of size size.
function nonAdjacencies(num, size) {
  return _u.difference(universe(size), [num-1, num, num+1]);
}

var relCoords = [
  [-1,  0, 'U'],
  [ 1,  0, 'D'],
  [ 0, -1, 'L'],
  [ 0,  1, 'R']];

// Eliminate possibilities at the given cell based on possibilities of
// adjacent cells.
function eliminateAt(board, row, col) {
  var size = board.length;
  var options = board[row][col].num;
  if (options.length === 1) return options;
  var adjs = board[row][col].adj;

  return _u.intersection.apply(null, relCoords.map(function(coords) {
    return [coords[0]+row, coords[1]+col, coords[2]];
  }).filter(function(coords) {
    return coords[0] >= 0 && coords[0] < size &&
      coords[1] >= 0 && coords[1] < size;
  }).map(function(coords) {
    var selector;
    var neighborOptions = board[coords[0]][coords[1]].num;
    if (adjs.indexOf(coords[2]) !== -1) {
      selector = adjacencies;
    } else {
      selector = nonAdjacencies;
    }
    return _u.union.apply(null, neighborOptions.map(function(val) {
      return selector(val, size);
    }));
  }));
}

// Don't know what to call this, but when you have, for example, two
// cells each with the possibilities [1,2], you know no other cell in
// the line can be 1 or 2. Likewise when you have three cells with
// possibilities [1,3,5], [3,5], and [1,3,5], you know no other cell
// in the line can be 1, 3, or 5. This function detects such situations
// and eliminates options accordingly.
//
// Takes: array of cells,
// where each cell is an array of possible values.
//
// Returns: same, possibly with some possible values removed.
function reduceLinePossibilities(line) {
  line = line.slice();

  for (var i = 0; i < line.length; i++) {
    cellSet = [i];
    for (var j = 0; j < line.length; j++) {
      if (i === j) continue;
      if (_u.isEqual(_u.union(line[i], line[j]), line[i])) {
        cellSet.push(j);
      }
    }

    if (cellSet.length === line[i].length) {
      for (j = 0; j < line.length; j++) {
        if (cellSet.indexOf(j) !== -1) continue;
        line[j] = _u.difference(line[j], line[i]);
      }
    }
  }

  return line;
}

// Iterates over board cells trying to make inferences that reduce the
// possibilities at each cell (modifying 'board' in-place). Returns true
// if anything was changed.
function solveStep(board) {
  var changed = false;

  for (var row = 0; row < board.length; row++) {
    for (var col = 0; col < board.length; col++) {
      var newPossibilities = eliminateAt(board, row, col);
      if (newPossibilities.length === 0) {
        throw new Error('board is unsolvable: no options at ' + row + ', ' +
                        col);
      }
      if (newPossibilities.length < board[row][col].num.length) {
        board[row][col].num = newPossibilities;
        changed = true;
      }
    }
  }

  for (col = 0; col < board.length; col++) {
    var line = _u.range(board.length).map(function(row) {
      return board[row][col].num;
    });
    line = reduceLinePossibilities(line);
    line.forEach(function(newnums, row) {
      if (!_u.isEqual(newnums, board[row][col].num)) {
        changed = true;
        board[row][col].num = newnums;
      }
    });
  }

  for (row = 0; row < board.length; row++) {
    var line = _u.range(board.length).map(function(col) {
      return board[row][col].num;
    });
    line = reduceLinePossibilities(line);
    line.forEach(function(newnums, col) {
      if (!_u.isEqual(newnums, board[row][col].num)) {
        changed = true;
        board[row][col].num = newnums;
      }
    });
  }

  return changed;
}

function solveBoard(board) {
  while (solveStep(board))
    ;
}

printBoard(exports.parseGame(sampleGame));
