var assert = require('assert');

var adjacent = require('../adjacent');

var sampleGameString = '3a:1,0RD,0DL,0RD,0URDL,0UL,0UR,0UL,0,';

var sampleGameParsed = [
  [{num: [1], adj: []},
   {num: [1,2,3], adj: ['R','D']},
   {num: [1,2,3], adj: ['D','L']}],
  [{num: [1,2,3], adj: ['R','D']},
   {num: [1,2,3], adj: ['U','R','D','L']},
   {num: [1,2,3], adj: ['U','L']}],
  [{num: [1,2,3], adj: ['U','R']},
   {num: [1,2,3], adj: ['U','L']},
   {num: [1,2,3], adj: []}]];

var invalidGameStrings = [
  {str: '3a:1,0RD,0DL,0RD,0URDL,0UL,0UR,0UL,0',
   reason: 'missing comma at end'},
  {str: '3a:1,0RD,0DL,0RD,0URDL,0UL,0UR,0U,0,',
   reason: 'conflict: UR left of U'},
  {str: '3a:1,0RD,0DL,0RD,0URDL,0UL,0UR,0UL,0,0,',
   reason: 'wrong number of cells'},
  {str: '3a:4,0RD,0DL,0RD,0URDL,0UL,0UR,0UL,0,',
   reason: 'cell value out of range'}];

describe('game parser', function() {
  it('parses games', function() {
    var parsed = adjacent.parseGame(sampleGameString);
    assert.deepEqual(parsed, sampleGameParsed);
  });

  it('throws on invalid game strings', function() {
    invalidGameStrings.forEach(function(invalid) {
      assert.throws(function() {
        adjacent.parseGame(invalid.str);
      }, 'should reject "' + invalid.str + '"\nbecause ' + invalid.reason);
    });
  });
});
