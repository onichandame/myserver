$(document).ready(function(){
  adjustcanvas()
})
function adjustcanvas(){
  const total=$(window).height()
  const navbar=$('header').height()
  const p=total-navbar
  $('#profile').css('height',p)
  $('#cvs').css('height',p)
}
