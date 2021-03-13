const home = document.getElementById("home");
const about = document.getElementById("about");
const accountOwner = document.getElementById("accountOwner");
let communityData;

const friendListSelectHeader = document.getElementById(
  "friendListSelectHeader"
);
const friendListRequestStatusHeader = document.getElementById(
  "friendListRequestStatusHeader"
);
const friendListOnlineStatusHeader = document.getElementById(
  "friendListOnlineStatusHeader"
);
const friendListGameStatusHeader = document.getElementById(
  "friendListGameStatusHeader"
);

const communityListSelectHeader = document.getElementById(
  "communityListSelectHeader"
);
const communityListMembershipHeader = document.getElementById(
  "communityListMembershipHeader"
);
const communityListMembersHeader = document.getElementById(
  "communityListMembersHeader"
);
const communityTab = document.getElementById("CommunitiesTab");
const friendsTab = document.getElementById("friendsTab");

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

function removeFriendFromTable(data) {
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];

  let friendId = data["id"];
  let rowIndex = getRowIndexByTagName(table, friendId);
  if (rowIndex >= 0) {
    table.deleteRow(rowIndex);
  }
}
function removeSelectedFriends() {
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];
  let selectedFriends = getSelectedFrom(table);
  let sender = accountOwner.innerHTML;
  if (selectedFriends.length === 0) {
    alertUserWithModal(
      'Please <u style = "color:red">Select Friends to Remove</u> and Click Again',
      "black"
    );
  } else {
    clearSelectionFrom(table);
    hideColumnsOfTable(table, [0]);
    friendListSelectHeader.innerHTML = "Select";
    friendListSelectHeader.style.backgroundColor = "lightblue";
    friendListSelectHeader.removeEventListener(
      "click",
      removeSelectedFriends,
      false
    );
    data = { sender: sender, receivers: selectedFriends };
    clientSocketEmit("removeFriends", data);
  }
}
function deleteFriends() {
  let table = document.getElementById("friends-table");
  showColumnsOfTable(table, [0]);
  friendListSelectHeader.innerHTML = "DEL";
  friendListSelectHeader.style.backgroundColor = "brown";
  friendListSelectHeader.addEventListener(
    "click",
    removeSelectedFriends,
    false
  );
}

function addFriendUsingModal() {
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];
  clearSelectionFrom(table);
  hideColumnsOfTable(table, [0]);
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

function createCommunityUsingModal() {
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];
  clearSelectionFrom(table);
  hideColumnsOfTable(table, [0]);
  alertUserWithModal(
    "Please enter a <strong> CommunityID,CommunityName </strong> <div> Then <strong>Select</strong> members from <strong>FriendsList</strong></div>",
    "black",
    "Create",
    null,
    true,
    "createCommunityYesButton"
  );
  //document.getElementById("addFriendYesButton").click()
}

function createCommunity() {
  let table = document
    .getElementById("communities-table")
    .getElementsByTagName("tbody")[0];
  let userResponse = formToDict(document.forms["alertUserInputForm"]);
  let communityId = null;
  let communityName = null;
  if (
    userResponse["alertUserInputData"] !== "" &&
    userResponse["alertUserResponse"] === "yes"
  ) {
    [communityId, communityName] = userResponse["alertUserInputData"].split(
      ","
    );
  }

  let sender = accountOwner.innerHTML;
  if (getRowIndexByTagName(table, communityId) > -1) {
    alertUserWithModal(
      "Already found  the community in CommunitiesList communityId = " +
        communityId
    );
  } else if (communityId !== null) {
    if (communityName === null || communityName === "") {
      communityName = communityId;
    }
    document.getElementById("createCommunitySender").value = sender;
    document.getElementById("createCommunityId").value = communityId;
    document.getElementById("createCommunityName").value = communityName;
    selectMembersToAdd();
  } else {
    document.getElementById("createCommunitySender").value = "";
    document.getElementById("createCommunityId").value = "";
    msg = document.getElementById("alertUserMessage").innerHTML;
    if (!msg.includes("empty"))
      msg = msg + '<div style = "color:red">Community Id can\'t be empty</div>';
    document.getElementById("alertUserMessage").innerHTML = msg;
  }
}
function addSelectedToCommunity() {
  let communityId = document.getElementById("createCommunityId").value;
  let communityName = document.getElementById("createCommunityName").value;
  let sender = accountOwner.innerHTML;
  let table = document
    .getElementById("friends-table")
    .getElementsByTagName("tbody")[0];
  let members = getSelectedFrom(table);
  members.push(sender);
  clearSelectionFrom(table);
  hideColumnsOfTable(table, [0]);
  friendListSelectHeader.innerHTML = "Select";
  friendListSelectHeader.style.backgroundColor = "lightblue";
  friendListSelectHeader.removeEventListener(
    "click",
    removeSelectedFriends,
    false
  );
  data = {
    owner: sender,
    members: members,
    communityid: communityId,
    name: communityName,
    communitytype: "group",
  };
  clientSocketEmit("createCommunity", data);
}
function selectMembersToAdd() {
  let table = document.getElementById("friends-table");
  closeUserAlertModal();
  friendsTab.click();
  showColumnsOfTable(table, [0]);
  friendListSelectHeader.innerHTML = "ADD";
  friendListSelectHeader.style.backgroundColor = "green";
  friendListSelectHeader.addEventListener(
    "click",
    addSelectedToCommunity,
    false
  );
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

function rejectFriendRequest() {
  let userResponse = formToDict(document.forms["alertUserInputForm"]);
  let friend = userResponse["alertUserInputData"];
  let sender = accountOwner.innerHTML;

  if (friend !== null && friend != "") {
    data = { sender: sender, receivers: [friend] };
    clientSocketEmit("removeFriends", data);
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

function getCommunities() {
  data = { sender: accountOwner.innerHTML };
  clientSocketEmit("getCommunities", data);
}
function getFriends() {
  home.innerHTML = "";
  about.innerHTML = "";
  friendListSelectHeader.innerHTML = "";
  friendListRequestStatusHeader.innerHTML = "";
  friendListOnlineStatusHeader.innerHTML = "";
  friendListGameStatusHeader.innerHTML = "";
  communityData = {};
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
    if (data["onlineStatus"]) {
      document.getElementById(friendId + "_dot").classList.add("dot-online");
    } else {
      document.getElementById(friendId + "_dot").classList.remove("dot-online");
    }
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
function addCommunityToTable(data) {
  let table = document
    .getElementById("communities-table")
    .getElementsByTagName("tbody")[0];
  console.log(data);
  let communityId = data["id"];
  if (getRowIndexByTagName(table, communityId) === -1) {
    let row = table.insertRow();
    row.id = communityId;

    let selectrow = row.insertCell(0);
    let cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = communityId + "_cb";
    selectrow.appendChild(cb);
    selectrow.style.display = "none";

    let rowCommunityName = row.insertCell(1);
    rowCommunityName.innerHTML =
      '<strong id="' + communityId + '_name">' + data["name"] + "</strong>";

    let rowOpponents = row.insertCell(2);
    let opponents = document.createElement("select");
    opponents.id = communityId + "_opp";
    opponents.addEventListener("change", function () {
      updateCommunityResults(communityId);
    });
    let option = document.createElement("option");
    option.value = "All Members";
    option.text = "All Members";
    opponents.appendChild(option);

    communityData[communityId] = data;
    for (const opponent of data["opponents"]) {
      let option = document.createElement("option");
      option.value = opponent;
      option.text = data["opponentnames"][opponent];
      opponents.appendChild(option);
    }
    rowOpponents.appendChild(opponents);

    let rowMembershipStatus = row.insertCell(3);
    rowMembershipStatus.innerHTML = data["membership"];
    rowMembershipStatus.style.display = "none";

    let rowWins = row.insertCell(4);
    rowWins.innerHTML = '<span id = "' + communityId + '_wins">';

    let rowLosses = row.insertCell(5);
    rowLosses.innerHTML = '<span id = "' + communityId + '_losses">';

    let rowDraws = row.insertCell(6);
    rowDraws.innerHTML = '<span id = "' + communityId + '_draws"></span>';

    updateCommunityResults(communityId);
  }
}

function updateCommunityResults(communityId) {
  let opponent = document.getElementById(communityId + "_opp").value;
  let winsEl = document.getElementById(communityId + "_wins");
  let lossesEl = document.getElementById(communityId + "_losses");
  let drawsEl = document.getElementById(communityId + "_draws");
  winsEl.innerHTML = communityData[communityId]["wins"][opponent];
  lossesEl.innerHTML = communityData[communityId]["losses"][opponent];
  drawsEl.innerHTML = communityData[communityId]["draws"][opponent];
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
    rowUserName.innerHTML =
      '<span class = "dot dot-sm" id ="' +
      friendId +
      '_dot"></span><span id ="' +
      friendId +
      '_name">' +
      data["name"] +
      "</span>";
    rowUserName.style.width = "70%";

    if (data["onlineStatus"]) {
      document.getElementById(friendId + "_dot").classList.add("dot-online");
    } else {
      document.getElementById(friendId + "_dot").classList.remove("dot-online");
    }

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

    [rowUserName, rowWins, rowLosses, rowDraws].forEach(function (cellEl) {
      cellEl.addEventListener("click", function () {
        friendRowOnClick(friendId);
      });
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
    let friendName = document.getElementById(friendId + "_name").innerHTML;
    if (ReqStatus == "inviteSent") {
      alertUserWithModal(
        'Waiting for <u style = "color:red">' +
          friendName.bold() +
          '</u> to reply to your Friend Request <div>Do you want to <strong style = "color:red">Rescind/Cancel</strong> to sent invite?</div>',
        "black",
        null,
        "Rescind",
        false,
        null,
        "acceptFriendNoButton",
        friendId
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
