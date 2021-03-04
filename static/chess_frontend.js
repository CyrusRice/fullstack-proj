// Variables
let config = {
  draggable: true,
  pieceTheme: "/static/img/{piece}.png",
  showNotation: false,
  position: "start",
  onDrop: onDrop,
};

let board = Chessboard("myBoard", config);
const chess = new Chess();
let gameOver = false;
let url = window.location.href;
let defaultFen = chess.fen();
let socket = io();
let currGameId = '';


// sockets
socket.on("connect", () => {
  url_list = url.replace(/^(?:\/\/|[^/]+)*\//, "").split("/");
  if (url_list.length > 1) {
    user = url_list[1];
    console.log(user + "is connected");
    socket.emit("connected", {
      userid: user,
    });
  }
});

// Update board/game based on other clients moves
socket.on("broadcast fen", (data) => {
  chess.load(data["fen"]);
  board.position(data["fen"].split(" ")[0]);
});

// Load new game sent from server
socket.on('load game', data => {
  let game = JSON.parse(data)
  //console.log(data);
  chess.load(game[0].fen);
  board.position(game[0].fen.split(' ')[0]);
  currGameId = game[0].gameid;
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
<<<<<<< HEAD
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

// Save current game before new one is loaded
$('#loadGame').on('click', function loadSaveGame() {
  console.log(chess.fen());
  console.log(currGameId);
  console.log(document.getElementById('games').value);
  socket.emit('load save game', {
    fen: chess.fen(), 
    currgameid: currGameId,
    newgameid: document.getElementById('games').value,
  });
})

// When player makes move, validate it before accepting
function onDrop(source, target, piece, newPos, oldPos, orientation) {
  // Move piece if valid move
  const obj = { from: source, to: target };
  let moveSuccess = chess.move(obj);
  if (moveSuccess === null || gameOver) return "snapback";
  // Stop board movement if game over
  if (chess.game_over()) gameOver = true;
  updateBoard();
}

// Update board for all when one player moves (will change to only 
// update for people in the same game)
function updateBoard() {
  socket.emit("update board", {
    fen: chess.fen(),
  });
}
