$(document).ready(function(){
  $("#form-auth").attr('action',window.location.href)
  $('input[name=username]').change(function(){
    if($('input[name=username]').val().length<7){
      $('#submit').attr('disabled',true)
      $('#username-warning').html()
      var popper=new Popper($('input[name=username]'),$('#username-warning'),{placement:right,
      })
      $()
    }else{
      $('#submit').removeAttr('disabled')
    }
  })
})
