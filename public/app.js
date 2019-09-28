$(document).ready(function(){
  adjustcanvas()
  $('.app').addClass('active')
  $(window).on('resize',()=>{adjustcanvas()})
})
function adjustcanvas(){
  const total=$(window).outerHeight()
  const overbar=$('header').outerHeight()
  const link=$('.apps-reg').outerHeight()
  var p=total-overbar-link
  $('.apps').css('height',p)
}
