$(document).ready(function(){
  const total=$(window).height()
  const navbar=$('header').height()
  const p=total-navbar
  $('#profile').css('height',p)
})
