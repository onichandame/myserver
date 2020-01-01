$(document).ready(function(){
  adjustcanvas()
  $(window).on('resize',()=>{adjustcanvas()})
})
function adjustcanvas(){
  const total=$(window).outerHeight()
  const overbar=$('header').outerHeight()
  const headline=$('#headline').outerHeight()
  const welcome=$('#welcome').outerHeight()
  var p=total-overbar
  $('#home').css('height',p)
  $('#projects').css('height',p)
  p=p-headline
  $('#experience').css('height',p)

  $('.home').addClass('active')
}
