// Decline player move if space is occupied by one of their pieces
function onDrop (source, target, piece, newPos, oldPos, orientation) {
  // Need to check for valid move
  const obj = {from : source, to : target};
  var moveSuccess = chess.move(obj);
  if (moveSuccess === null) 
    return 'snapback';
  else 
    return;
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
