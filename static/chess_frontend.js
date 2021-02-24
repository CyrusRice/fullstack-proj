// When player makes move, validate it before accepting
function onDrop (source, target, piece, newPos, oldPos, orientation) {
  // Move piece if valid move
  const obj = {from : source, to : target};
  var moveSuccess = chess.move(obj);
  if (moveSuccess === null || gameOver) 
    return 'snapback';
  // Stop board movement if game over
  if (chess.game_over())
    gameOver = true;
}

// Start new game & reset board when 'New Game' button pressed
$('#startPositionBtn').on('click', function newGame() {
  gameOver = false;
  chess.reset();
  board.start(false);
})

// Variables
var config = {
    draggable: true,
    pieceTheme: 'static/img/{piece}.png',
    showNotation: false,
    position: 'start',
    onDrop: onDrop
}

var board = Chessboard('myBoard', config)
const chess = new Chess();
var gameOver = false;