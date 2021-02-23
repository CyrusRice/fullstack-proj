// Decline player move if space is occupied by one of their pieces
function onDrop (source, target, piece, newPos, oldPos, orientation) {
  // Need to check for valid move, meaning 
  // - It's your turn (b/w)
  // - You're moving on a valid square
  //   (a) Can't move on own piece (b/w)
  //   (b) Limited by type of piece (k/q/p/n/r/b)
  //   (c) Can't make move if it results in checkmate
  /*console.log('piece: ' + piece)
  console.log('source: ' + source)
  console.log('target: ' + target)
  console.log('newPos: ' + newPos)
  console.log('oldPos: ' + oldPos)
  console.log('orientation: ' + orientation)*/
  /*if(board.position()[target] === undefined)
    return
  if ((piece.search(/b/) !== -1) && (board.position()[target].search(/b/) !== -1) ||
  (piece.search(/w/) !== -1) && (board.position()[target].search(/w/) !== -1)) {
    return 'snapback'
  }*/
  /*if(chess.validate_fen(new Chess(Chessboard.objToFen(newPos)).fen()).valid === true) {
    console.log('good!');
  } else {
    console.log('bad');
  }*/
}


var config = {
    draggable: true,
    pieceTheme: 'static/img/{piece}.png',
    //showNotation: false,
    position: 'start',
    onDrop: onDrop
}
var board = Chessboard('myBoard', config)
$('#startPositionBtn').on('click', board.start)

const chess = new Chess();

// Start a new game
/*function newGame () {
  

}*/
