function formToDict(formEl) {
  let formDict = {};
  let formData = new FormData(formEl);
  formData.forEach(function (value, key) {
    formDict[key] = value;
  });
  return formDict;
}

function alertUserWithModal(message,color="red",yesButton = null,noButton = null,getUserTextInput=false,yesResponseId=null,noResponseId=null) {
  document.getElementById("alertUserMessage").style.color = color
  document.getElementById("alertUserMessage").innerHTML = message;
  let yesButtonEl = document.getElementById("alertUserYesButton")
  if (getUserTextInput) {
    document.getElementById("alertUserInputData").type = "text"
  } else {
    document.getElementById("alertUserInputData").value = ""
    document.getElementById("alertUserInputData").type = "hidden"    
  }  
  if (yesButton !== null) {
    yesButtonEl.innerHTML = yesButton
    yesButtonEl.style.display = "block"
    yesResponseEl = null
    if(yesResponseId !==null) {
      yesResponseEl = document.getElementById("yesResponseId")
    }
    //yesButtonEl.onclick == null
    print(yesResponseEl)
    //yesButtonEl.addEventListener("click", function () {
    //    recordAlertUserResponse(true,yesResponseEl,null)
    //});
    
  } else {
    document.getElementById("alertUserYesButton").innerHTML = ""
    document.getElementById("alertUserYesButton").style.display = "none"    
  }
  if (noButton !== null) {
    document.getElementById("alertUserNoButton").innerHTML = noButton
    document.getElementById("alertUserNoButton").style.display = "block"
  } else {
    document.getElementById("alertUserNoButton").innerHTML = ""
    document.getElementById("alertUserNoButton").style.display = "none"    
  }
  document.getElementById("alertUserButton").click();
}

function getRowIndexByTagName(table,tagName) {
  let rowCount = table.rows.length;    
  let i;
  for(i=0;i<rowCount;i++){
    let row = table.rows[i];
    if(row.id == tagName) {
      break;
    }
  }
  if (i < rowCount) {
    return i;
  } else {
    return -1;
  }
}

function recordAlertUserResponse(userResponse=null,yesResponseEl=null,noResponseEl=null){
  if (userResponse === null){
    document.getElementById("alertUserInputData").value = ""
    document.getElementById("alertUserResponse").value = ""
    document.getElementById("alertUserCloseButton").click();
  } else if (userResponse) {
    document.getElementById("alertUserResponse").value = "yes"
    if (yesResponseEl != null) {
      yesResponseEl.click()
    } 
  } else {
    document.getElementById("alertUserResponse").value = "no"
    if (noResponseEl != null) {
      noResponseEl.click()
    }    
  }

  
}

function closeUserAlertModal(){
  document.getElementById("alertUserInputData").type = "hidden"    
  document.getElementById("alertUserInputData").value = ""
  document.getElementById("alertUserResponse").value = ""  
  document.getElementById("alertUserCloseButton").click();  
}
