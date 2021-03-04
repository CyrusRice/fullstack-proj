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
let defaultFen = chess.fen();
let socket = io();
let currGameId = '';

// sockets
/*socket.on('my response', function(msg) {
  $('#startPositionBtn').append(msg);
  console.log('moved');
});*/

socket.on('broadcast fen', data => {
  chess.load(data['fen']);
  board.position(data['fen'].split(' ')[0]);
});

socket.on('load game', data => {
  if (currGameId !== '') {
    socket.emit('save game', {
      fen: chess.fen(), 
      gameid: currGameId
    });
  }
  chess.load(data['fen']);
  board.position(data['fen'].split(' ')[0]);
  currGameId = data['gameid'];
});

// Server sent games list from mongodb, add each game to home.html drop down list
socket.on('send games', data => {
  let gameslist = JSON.parse(data);
  for (let i = 0; i < gameslist.length; i++) {
    let newGame = document.createElement("option");
    newGame.value = gameslist[i].gameid;
    newGame.textContent = gameslist[i].gameid;
    document.getElementById('games').appendChild(newGame);
  }
});

/* Start new game & reset board when 'New Game' button pressed
$('#startPositionBtn').on('click', function newGame() {
  gameOver = false;
  chess.reset();
  console.log(chess.fen());
  board.start(false);
  updateBoard();
})*/

// Fill out home.html games drop down form as soon as page is loaded by getting games from mongodb
$(document).ready(function() {
  socket.emit('get games', {});
});

/* Add new game to list using game id entered
$('#addGame').on('click', function addGame() {
  let addGameForm = document.forms["addGameForm"];
  let gameId = document.getElementById('gameId').value;
  let newGame = document.createElement("option");
  newGame.value = gameId;
  newGame.textContent = gameId;
  document.getElementById('games').appendChild(newGame);
  //savedGames.set(gameId, defaultFen);
  addGameForm.submit();
})*/

/* Add new game to list using game id entered
$('#loadGame').on('click', function loadGame() {
  if(currGameId != '') 
    savedGames.set(currGameId, chess.fen());
  let gameId = document.getElementById('games').value;
  chess.load(savedGames.get(gameId));
  board.position(savedGames.get(gameId).split(' ')[0])
  currGameId = gameId;
})*/

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