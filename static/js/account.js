$(document).ready(function(){
    activateTab('FriendsContent');
  });
  
  function activateTab(tab){
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
  };