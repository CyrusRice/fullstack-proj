let socket = io();
let currGameId = "";
let url = window.location.href;
let playerColor = "";

socket.on("connect", () => {
  url_list = url.replace(/^(?:\/\/|[^/]+)*\//, "").split("/");
  if (url_list.length > 1) {
    user = url_list[1];
    console.log(user + " is connected");
    socket.emit("connected", {
      userid: user,
    });
  }
});

// Update board/game based on other clients moves
socket.on("broadcast fen", (data) => {
  chess.load(data["fen"]);
  board.position(data["fen"].split(" ")[0]);
  gameOver = data["gameover"];
  if (gameOver === true) {
    alertUserWithModal("Game Over");
    //socket.emit('get games', {userId: userId});
  }
});

// Update board/game based on other clients moves
socket.on("add game", (data) => {
  if ((data['p1'] === document.getElementById('accountOwner').textContent) ||
  (data['p2'] === document.getElementById('accountOwner').textContent)) {
    if ((data['invalidgameid'] === false) && (data['invalidplayer2'] === false)) {
      let newGame = document.createElement("option");
      newGame.value = data['gameid'];
      newGame.textContent = data['gameid'];
      document.getElementById('gameslist').appendChild(newGame);
    } else if (data['p1'] === document.getElementById('accountOwner').textContent) {
      if (data['invalidgameid'] === true) {
        alertUserWithModal("That game id is already in use");
      } else if (data['invalidplayer2'] === true) {
        alertUserWithModal("No user with that user id exists");
      }
    }
    //console.log('stuff');
  }
  //console.log('stuff2');
});

// Load new game sent from server
socket.on("load game", (data) => {
  let game = JSON.parse(data);
  //console.log(data);
  if (
    game[0].player_1 === document.getElementById("accountOwner").textContent
  ) {
    // If playing self, don't assign a piece color to player
    if (game[0].player_1 === game[0].player_2) {
      playerColor = "n/a";
    } else {
      playerColor = "w";
    }
  } else {
    playerColor = "b";
  }
  chess.load(game[0].fen);
  board.position(game[0].fen.split(" ")[0]);
  currGameId = game[0].gameid;
  document.getElementById("myBoard").style = "width: 30%;display:block";
  document.getElementById("endGameBtn").style = "display:block";
});

// Server sent games list from mongodb, add each game to home.html drop down list
socket.on("send games", (data) => {
  let gameslist = JSON.parse(data);
  for (let i = 0; i < gameslist.length; i++) {
    let newGame = document.createElement("option");
    newGame.value = gameslist[i].gameid;
    newGame.textContent = gameslist[i].gameid;
    document.getElementById("gameslist").appendChild(newGame);
  }
});

socket.on("alertUser", (data) => {
  alertUserWithModal(data["message"]);
});

function clientSocketEmit(message, data) {
  socket.emit(message, data);
}

socket.on("connectionRecorded", () => {
  getFriends();
});

socket.on("addFriendToTable", (data) => {
  addFriendToTable(data);
  closeUserAlertModal();
});

socket.on("addCommunityToTable", (data) => {
  addCommunityToTable(data);
  closeUserAlertModal();
});

socket.on("removeFriendInTable", (data) => {
  removeFriendFromTable(data);
  closeUserAlertModal();
});

socket.on("updateFriendDataInTable", (data) => {
  updateFriendDataInTable(data);
  closeUserAlertModal();
});
socket.on("populateFriendsList", (data) => {
  let friendsList = [];
  for (const [friendId, friendData] of Object.entries(data)) {
    friendsList.push(friendData);
  }
  friendsList.sort((a, b) => (a.name > b.name ? 1 : -1));
  friendsList.forEach(function (friendData) {
    addFriendToTable(friendData);
  });
  //socket.emit('get games', {})
});

function getSocketID() {
  return socket.id;
}
