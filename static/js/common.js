function formToDict(formEl) {
  let formDict = {};
  let formData = new FormData(formEl);
  formData.forEach(function (value, key) {
    formDict[key] = value;
  });
  return formDict;
}

function alertUserWithModal(message) {
  document.getElementById("alertUserMessage").innerHTML = message;
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
