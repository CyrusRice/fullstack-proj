function formToDict(formEl) {
  let formDict = {};
  let formData = new FormData(formEl);
  formData.forEach(function (value, key) {
    formDict[key] = value;
  });
  return formDict;
}

function alertUserWithModal(
  message,
  color = "black",
  yesButton = null,
  noButton = null,
  getUserTextInput = false,
  yesResponseId = null,
  noResponseId = null,
  setUserTextInput = null
) {
  document.getElementById("alertUserTitle").innerHTML = "";
  document.getElementById("alertUserMessage").style.color = color;
  document.getElementById("alertUserMessage").innerHTML = message;
  let yesButtonEl = document.getElementById("alertUserYesButton");
  let noButtonEl = document.getElementById("alertUserNoButton");
  if (getUserTextInput) {
    document.getElementById("alertUserInputData").type = "text";
  } else {
    if (setUserTextInput === null) {
      document.getElementById("alertUserInputData").value = "";
    } else {
      document.getElementById("alertUserInputData").value = setUserTextInput;
    }
    document.getElementById("alertUserInputData").type = "hidden";
  }
  if (yesButton !== null) {
    yesButtonEl.innerHTML = yesButton;
    yesButtonEl.style.display = "block";
    yesButtonEl.value = yesResponseId;
  } else {
    yesButtonEl.innerHTML = "";
    yesButtonEl.style.display = "none";
    yesButtonEl.value = null;
  }
  if (noButton !== null) {
    noButtonEl.innerHTML = noButton;
    noButtonEl.style.display = "block";
    noButtonEl.value = yesResponseId;
  } else {
    noButtonEl.innerHTML = "";
    noButtonEl.style.display = "none";
    noButtonEl.value = null;
  }
  if (document.getElementById("alertUserButton").value !== "alertUserIsOpen") {
    document.getElementById("alertUserButton").value = "alertUserIsOpen";
    document.getElementById("alertUserButton").click();
  }
}

function getRowIndexByTagName(table, tagName, hideCols = []) {
  let rowCount = table.rows.length;
  let i;
  for (i = 0; i < rowCount; i++) {
    let row = table.rows[i];
    if (row.id === tagName) {
      break;
    }
  }
  if (i < rowCount) {
    return i;
  } else {
    return -1;
  }
}

function getSelectedFrom(table) {
  let selectedRows = [];
  let rowCount = table.rows.length;
  let i;
  for (i = 0; i < rowCount; i++) {
    let row = table.rows[i];
    let tagName = row.id;
    let cb = document.getElementById(tagName + "_cb");
    if (cb.checked === true) {
      selectedRows.splice(0, 0, tagName);
    }
  }
  return selectedRows;
}

function recordAlertUserResponse(
  userResponse = null,
  yesResponseEl = null,
  noResponseEl = null
) {
  if (userResponse === null) {
    document.getElementById("alertUserInputData").value = "";
    document.getElementById("alertUserResponse").value = "";
    document.getElementById("alertUserCloseButton").click();
  } else if (userResponse) {
    document.getElementById("alertUserResponse").value = "yes";
    yesResponseId = document.getElementById("alertUserYesButton").value;
    if (yesResponseId != null) {
      document.getElementById(yesResponseId).click();
    }
  } else {
    document.getElementById("alertUserResponse").value = "no";
    noResponseId = document.getElementById("alertUserNoButton").value;
    if (noResponseId != null) {
      document.getElementById(noResponseId).click();
    }
  }
}

function closeUserAlertModal() {
  document.getElementById("alertUserInputData").type = "hidden";
  document.getElementById("alertUserInputData").value = "";
  document.getElementById("alertUserResponse").value = "";
  document.getElementById("alertUserButton").value = "alertUserIsClose";
  document.getElementById("alertUserCloseButton").click();
}

function hideColumnsOfTable(table, cols = []) {
  elType = table.tagName.toLowerCase();
  let targetTable = table;
  if (elType === "tbody") {
    targetTable = table.parentElement;
  }

  if (cols.length > 0)
    cols.forEach(function (col) {
      let colSelector = targetTable.querySelectorAll("tr");
      colSelector.forEach(function (row) {
        row.cells[col].style.display = "none";
      });
    });
}

function showColumnsOfTable(table, cols = []) {
  elType = table.tagName.toLowerCase();
  let targetTable = table;
  if (elType === "tbody") {
    targetTable = table.parentElement;
  }

  if (cols.length > 0)
    cols.forEach(function (col) {
      let colSelector = targetTable.querySelectorAll("tr");
      colSelector.forEach(function (row) {
        row.cells[col].style.display = "block";
      });
    });
}
