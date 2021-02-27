// Variables
let config = {
  draggable: true,
  pieceTheme: 'static/img/{piece}.png',
  showNotation: false,
  position: 'start',
  onDrop: onDrop
}

let board = Chessboard('myBoard', config)
const chess = new Chess();
let gameOver = false;

let socket = io();

// sockets
/*socket.on('my response', function(msg) {
  $('#startPositionBtn').append(msg);
  console.log('moved');
});*/

socket.on('broadcast fen', data => {
  chess.load(data['fen']);
  board.position(data['fen'].split(' ')[0]);
});

socket.emit('my event', {
  fen: chess.fen()
});

// Start new game & reset board when 'New Game' button pressed
$('#startPositionBtn').on('click', function newGame() {
  gameOver = false;
  chess.reset();
  board.start(false);
  updateBoard();
})

// When player makes move, validate it before accepting
function onDrop (source, target, piece, newPos, oldPos, orientation) {
  // Move piece if valid move
  const obj = {from : source, to : target};
  let moveSuccess = chess.move(obj);
  if (moveSuccess === null || gameOver) 
    return 'snapback';
  // Stop board movement if game over
  if (chess.game_over())
    gameOver = true;
  updateBoard();
}

function updateBoard() {
  socket.emit('update board', {
    fen: chess.fen()
  });
}