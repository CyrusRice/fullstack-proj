const home = document.getElementById("home");
const about = document.getElementById("about");
const accountOwner = document.getElementById("accountOwner");

window.onload = function () {
  home.innerHTML = "";
  about.innerHTML = "";
};

function addFriend() {
  friend = prompt("Please enter a Friend's ID", "");
  if (friend != null) {
    document.getElementById("addFriendSender").value = accountOwner.innerHTML;
    document.getElementById("addFriendReceiver").value = friend;
    data = formToDict(document.forms["addFriend"]);
    clientSocketEmit("addFriend", data);
    //document.forms["addFriend"].submit();
  } else {
    document.getElementById("addFriendSender").value = "";
    document.getElementById("addFriendReceiver").value = "";
  }
}

function getFriends() {
  document.getElementById("getFriendsSender").value = accountOwner.innerHTML
  data = formToDict(document.forms["getFriends"]);
  clientSocketEmit('getFriends', data);
}

function addFriendToTable(data) {
  let table = document.getElementById("friends-table");
  let friendId = data["id"];
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
}
