let socket = io();
let currGameId = "";
let url = window.location.href;

socket.on("connect", () => {
  url_list = url.replace(/^(?:\/\/|[^/]+)*\//, "").split("/");
  if (url_list.length > 1) {
    user = url_list[1];
    console.log(user + " is connected");
    console.log(window.localStorage)
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
socket.on("load game", (data) => {
  let game = JSON.parse(data);
  //console.log(data);
  chess.load(game[0].fen);
  board.position(game[0].fen.split(" ")[0]);
  currGameId = game[0].gameid;
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
  getFriends()
});

socket.on("addFriendToTable", (data) => {
  addFriendToTable(data);
  closeUserAlertModal()
});
socket.on("populateFriendsList", (data) => {
  for (const [friendId, friendData] of Object.entries(data)) {
    addFriendToTable(friendData);
  };
  //socket.emit('get games', {})
});

function getSocketID() {
  return socket.id;
}
