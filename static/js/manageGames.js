//===========================================Chess Related Code(START)=========================
// Variables
let config = {
    draggable: true,
    pieceTheme: "/static/img/{piece}.png",
    showNotation: false,
    position: "start",
    onDrop: onDrop,
  };
  
  let board = null;
  let chess = null;
  let gameOver = null;
  let defaultFen = null;
  let userId = null;
  //let socket = require('/static/js/socket.js').socket;

  // Fill out home.html games drop down form as soon as page is loaded by getting games from mongodb
  $(document).ready(function() {
    board = Chessboard("myBoard", config);
    chess = new Chess();
    gameOver = false;
    defaultFen = chess.fen();    
    userId = document.getElementById('accountOwner').textContent;
    clientSocketEmit('get games', {userId: userId});
  });
  
  // Add new game to list using game id entered
  $('#addGame').on('click', function addGame() {
    //let addGameForm = document.forms["addGameForm"];
    let p1 = document.getElementById('accountOwner').textContent;
    let p2 = document.getElementById('invitedPlayer').value;
    let gameId = document.getElementById('gameId').value;
    let newGame = document.createElement("option");
    newGame.value = gameId;
    newGame.textContent = gameId;
    document.getElementById('gameslist').appendChild(newGame);
    clientSocketEmit('add game', {
      gameid: gameId,
      p1: p1,
      p2: p2,
    });
    //savedGames.set(gameId, defaultFen);
    //addGameForm.submit();
  })
  
  // Save current game before new one is loaded
  $('#loadGame').on('click', function loadSaveGame() {
    //console.log(chess.fen());
    //console.log(currGameId);
    //console.log(document.getElementById('gameslist').value);
    clientSocketEmit('load save game', {
      fen: chess.fen(), 
      currgameid: currGameId,
      newgameid: document.getElementById('gameslist').value,
    });
  })
  
  // When player makes move, validate it before accepting
  function onDrop(source, target, piece, newPos, oldPos, orientation) {
    // Move piece if valid move
    const obj = { from: source, to: target };
    let turnColor = chess.fen().split(" ")[1];
    //let moveSuccess = chess.move(obj);
    if (gameOver || turnColor !== playerColor || chess.move(obj) === null) return "snapback";
    // Stop board movement if game over
    if (chess.game_over()) gameOver = true;
    updateBoard();
  }
  
  // Update board for all when one player moves (will change to only 
  // update for people in the same game)
  function updateBoard() {
    clientSocketEmit("update board", {
      fen: chess.fen(),
      currgameid: currGameId,
    });
  }
  //===========================================Chess Related Code(END)=========================