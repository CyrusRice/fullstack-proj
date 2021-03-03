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
let savedGames = new Map();
let currGameId = "";

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

socket.on("broadcast fen", (data) => {
  chess.load(data["fen"]);
  board.position(data["fen"].split(" ")[0]);
});

// Start new game & reset board when 'New Game' button pressed
$("#startPositionBtn").on("click", function newGame() {
  gameOver = false;
  chess.reset();
  board.start(false);
  updateBoard();
});

// Add new game to list using game id entered
$("#addGame").on("click", function addGame() {
  let gameId = document.getElementById("gameId").value;
  let newGame = document.createElement("option");
  newGame.value = gameId;
  newGame.textContent = gameId;
  document.getElementById("games").appendChild(newGame);
  savedGames.set(gameId, defaultFen);
});

// Add new game to list using game id entered
$("#loadGame").on("click", function loadGame() {
  if (currGameId != "") savedGames.set(currGameId, chess.fen());
  let gameId = document.getElementById("games").value;
  chess.load(savedGames.get(gameId));
  board.position(savedGames.get(gameId).split(" ")[0]);
  currGameId = gameId;
});

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

function updateBoard() {
  socket.emit("update board", {
    fen: chess.fen(),
  });
}
