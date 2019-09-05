$(document).ready(function(){
  var secret=$('.body').attr('href')
  var link=window.location.origin+'/activate?code='+secret
  $('.body').attr('href',link)
})
