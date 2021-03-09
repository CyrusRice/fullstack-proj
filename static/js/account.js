const home = document.getElementById("home");
const about = document.getElementById("about");
const accountOwner = document.getElementById("accountOwner");

window.onload = function () {
  home.innerHTML = "";
  about.innerHTML = "";
};

window.addEventListener("storage", function (event) {
  if (event.key == "logout-event") {
    let user = event.newValue;
    user = user.split(":")[0];
    if (accountOwner.innerHTML === user) {
      console.log(
        accountOwner.innerHTML + " has requested logout from another tab"
      );
      home.click();
    }
  }
});

function addFriendUsingModal() {
  alertUserWithModal(
    "Please enter a Friend's ID",
    "black",
    "Add",
    null,
    true,
    "addFriendYesButton"
  );
  //document.getElementById("addFriendYesButton").click()
}
function acceptFriendRequest() {
  let userResponse = formToDict(document.forms["alertUserInputForm"]);
  let friend = userResponse["alertUserInputData"];
  let sender = accountOwner.innerHTML;

  if (friend !== null && friend != "") {
    document.getElementById("acceptFriendSender").value = sender;
    document.getElementById("acceptFriendReceiver").value = friend;
    data = formToDict(document.forms["acceptFriend"]);
    clientSocketEmit("acceptFriendRequest", data);
  }
}
function addFriend() {
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];

  let userResponse = formToDict(document.forms["alertUserInputForm"]);
  let friend = null;
  if (
    userResponse["alertUserInputData"] !== "" &&
    userResponse["alertUserResponse"] === "yes"
  ) {
    friend = userResponse["alertUserInputData"];
  }

  //friend = prompt("Please enter a Friend's ID", "");
  let sender = accountOwner.innerHTML;
  if (friend === sender) {
    alertUserWithModal("Can't add yourself to your own friends list");
  } else if (getRowIndexByTagName(table, friend) > -1) {
    alertUserWithModal(
      "Already found  the user in FriendsList userid = " + friend
    );
  } else if (friend !== null) {
    document.getElementById("addFriendSender").value = sender;
    document.getElementById("addFriendReceiver").value = friend;
    data = formToDict(document.forms["addFriend"]);
    clientSocketEmit("addFriend", data);
  } else {
    document.getElementById("addFriendSender").value = "";
    document.getElementById("addFriendReceiver").value = "";
  }
}

function getFriends() {
  document.getElementById("getFriendsSender").value = accountOwner.innerHTML;
  data = formToDict(document.forms["getFriends"]);
  clientSocketEmit("getFriends", data);
}

function updateFriendDataInTable(data) {
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];
  let friendId = data["id"];
  let rowIndex = getRowIndexByTagName(table, friendId);
  if (rowIndex > -1) {
    let ReqStatusEl = table.rows[rowIndex].cells[2];
    let OnlineStatusEl = table.rows[rowIndex].cells[3];
    let GameStatusEl = table.rows[rowIndex].cells[4];
    let WinsEl = table.rows[rowIndex].cells[5];
    let LossesEl = table.rows[rowIndex].cells[6];
    let DrawsEl = table.rows[rowIndex].cells[7];

    ReqStatusEl.innerHTML = data["requestStatus"];
    OnlineStatusEl.innerHTML = data["onlineStatus"];
    GameStatusEl.innerHTML = data["gameStatus"];
    WinsEl.innerHTML = data["wins"];
    LossesEl.innerHTML = data["losses"];
    DrawsEl.innerHTML = data["draws"];
  }
  closeUserAlertModal();
}
function logout() {
  localStorage.setItem(
    "logout-event",
    accountOwner.innerHTML + ":" + Math.random()
  );
  home.click();
}
function sortFriendsListTable() {
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];
  sortTable(table, 1, [0, 2, 3, 4]);
}

function addFriendToTable(data) {
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];
  //console.log(table)
  let friendId = data["id"];
  if (getRowIndexByTagName(table, friendId) === -1) {
    let row = table.insertRow();
    row.id = friendId;

    let selectrow = row.insertCell(0);
    let cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = friendId + "_cb";
    selectrow.appendChild(cb);
    selectrow.style.display = "none";

    let rowUserName = row.insertCell(1);
    rowUserName.innerHTML = data["name"];
    rowUserName.style.width = "70%";

    let rowReqStatus = row.insertCell(2);
    rowReqStatus.innerHTML = data["requestStatus"];
    rowReqStatus.style.display = "none";

    let rowOnlineStatus = row.insertCell(3);
    online_cb = document.createElement("input");
    online_cb.type = "checkbox";
    online_cb.id = friendId + "_on";
    online_cb.checked = data["onlineStatus"];
    rowOnlineStatus.appendChild(online_cb);
    rowOnlineStatus.style.display = "none";

    let rowGameStatus = row.insertCell(4);
    rowGameStatus.innerHTML = data["gameStatus"];
    rowGameStatus.style.display = "none";

    let rowWins = row.insertCell(5);
    rowWins.innerHTML = data["wins"];

    let rowLosses = row.insertCell(6);
    rowLosses.innerHTML = data["losses"];

    let rowDraws = row.insertCell(7);
    rowDraws.innerHTML = data["draws"];

    row.addEventListener("click", function () {
      friendRowOnClick(friendId);
    });
  }
}

function friendRowOnClick(friendId) {
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];
  let rowIndex = getRowIndexByTagName(table, friendId);
  if (rowIndex > -1) {
    let ReqStatus = table.rows[rowIndex].cells[2].innerHTML;
    let friendName = table.rows[rowIndex].cells[1].innerHTML;
    if (ReqStatus == "inviteSent") {
      alertUserWithModal(
        'Waiting for <u style = "color:red">' +
          friendName.bold() +
          "</u> to reply to your Friend Request",
        "black"
      );
    } else if (ReqStatus == "pending") {
      alertUserWithModal(
        'You have New Friend Request from <u style = "color:red">' +
          friendName.bold() +
          "</u>",
        "black",
        "Accept",
        "Reject",
        false,
        "acceptFriendYesButton",
        "acceptFriendNoButton",
        friendId
      );
    }
  }
}
