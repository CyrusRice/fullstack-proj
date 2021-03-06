const home = document.getElementById("home");
const about = document.getElementById("about");
const accountOwner = document.getElementById("accountOwner");

window.onload = function () {
  home.innerHTML = "";
  about.innerHTML = "";
};
function addFriendUsingModal() { 
  alertUserWithModal("Please enter a Friend's ID","black","Add",null,true,"addFriendYesButton")
  //document.getElementById("addFriendYesButton").click()
}
function addFriend() {
  let table = document.getElementById("friends-table");
  
  let userResponse = formToDict(document.forms["alertUserInputForm"]);
  let friend = null
  if (userResponse["alertUserInputData"] !== "" && userResponse["alertUserResponse"] === "yes") {
    friend = userResponse["alertUserInputData"]
  }
  
  //friend = prompt("Please enter a Friend's ID", "");
  let sender = accountOwner.innerHTML;
  if (friend === sender) {
    //clientSocketEmit("closeAlertUser",{"message":"Can't add yourself to your own friends list"})
    alertUserWithModal("Can't add yourself to your own friends list");
  } else if (getRowIndexByTagName(table, friend) > -1) {
    alertUserWithModal("Already found  the user in FriendsList userid = " + friend);
    //clientSocketEmit("closeAlertUser",{"message":"Already found  the user in FriendsList userid = " + friend})
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

function addFriendToTable(data) {
  let table = document.getElementById("friends-table");
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
  let table = document.getElementById("friends-table");
  let rowIndex = getRowIndexByTagName(table, friendId);
  if (rowIndex > -1) {
    let ReqStatus = table.rows[rowIndex].cells[2].innerHTML;
    if (ReqStatus == "inviteSent") {
      alertUserWithModal("Friend Request is already sent to <u style = \"color:red\">" + friendId.bold() + "</u> waiting for response","black","Accept","Reject");
    }
      
    
  }
}
