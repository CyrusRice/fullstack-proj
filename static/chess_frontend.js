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
var defaultFen = chess.fen();
var socket = io();
var savedGames = new Map();
var currGameId = '';

// sockets
/*socket.on('my response', function(msg) {
  $('#startPositionBtn').append(msg);
  console.log('moved');
});*/

socket.on('broadcast fen', data => {
  chess.load(data['fen']);
  board.position(data['fen'].split(' ')[0]);
});

// Start new game & reset board when 'New Game' button pressed
$('#startPositionBtn').on('click', function newGame() {
  gameOver = false;
  chess.reset();
  board.start(false);
  updateBoard();
})

// Add new game to list using game id entered
$('#addGame').on('click', function addGame() {
  let gameId = document.getElementById('gameId').value;
  let newGame = document.createElement("option");
  newGame.value = gameId;
  newGame.textContent = gameId;
  document.getElementById('games').appendChild(newGame);
  savedGames.set(gameId, defaultFen);
})

// Add new game to list using game id entered
$('#loadGame').on('click', function loadGame() {
  if(currGameId != '') 
    savedGames.set(currGameId, chess.fen());
  let gameId = document.getElementById('games').value;
  chess.load(savedGames.get(gameId));
  board.position(savedGames.get(gameId).split(' ')[0])
  currGameId = gameId;
})

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
  updateBoard();
}

function updateBoard() {
  socket.emit('update board', {
    fen: chess.fen()
  });
}