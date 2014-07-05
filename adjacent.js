// Example game:
// 5a:0D,0,0,0RD,0DL,0U,0R,0DL,0U,0U,0D,0D,0UR,0L,0D,0UD,0U,1,0,0U,0UR,0L,0,0,5,

var sampleGame =
  "5a:0D,0,0,0RD,0DL,0U,0R,0DL,0U,0U,0D,0D,0UR,0L,0D,0UD,0U,1,0,0U,0UR,0L,0,0,5,";

exports.parseGame = function(str) {
  var matches = str.match(/^(\d+)a:((\d+[DLRU]*,)+)$/);
  var boardSize;
  if (!matches || (boardSize = parseInt(matches[1])) < 2) {
    throw new Error('invalid adjacent board');
  }
  var elements = matches[2].split(',').slice(0, -1);
};
