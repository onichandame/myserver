var valid={name:false,
  type:false,
  callback:false}
function update(){
  var flag=true
  // check radio
  if($('input:checked'))
    valid.type=true
  for(const i in valid){
    if(!valid[i])
      flag=false
  }
  // update button
  if(flag)
    $('#submit').attr('disabled',false)
  else
    $('#submit').attr('disabled',true)
  // name field
  flag=valid.name
  if(flag){
    if($('.name~p').length>0){
      $('.name~p').remove()
    }
  }else{
    if($('.name~p').length<1){
      $('.name').after('<p>At least 2 characters</p>')
      var popper=new Popper($('.name'),$('.name~p'),{placement:'right'})
    }
  }
  // callback field
  flag=valid.callback
  if(flag){
    if($('.callback~p').length>0){
      $('.callback~p').remove()
    }
  }else{
    if($('.callback~p').length<1){
      $('.callback').after('<p>invalid URI</p>')
      var popper=new Popper($('.callback'),$('.callback~p'),{placement:'right'})
    }
  }
}
$(document).ready(function(){
  $('input[name=name]').change(function(){
    if($('input[name=name]').val().length<3)
      valid.name=false
    else
      valid.name=true
    update()
  })
  $('input[name=callback]').change(function(){
    var regex=/[^\s]/
    if(regex.test($('input[name=callback]').val()))
      valid.callback=true
    else
      valid.callback=false
    update()
  })

  // Submission
  $('#submit').click(function(){
    let xhr=new XMLHttpRequest()
    xhr.open('POST','')
    const form=$('form').serializeArray()
    let type=0
    if($('input:checked').attr=='web'){
      type=0
    }else if($('input:checked').attr=='native'){
      type=1
    }else{
      alert('Unknown error occurred! Perhaps the page was hacked by an unauthorised individual.')
      return
    }
    let body='name='+$('input[name=name]').val()+'&callback='+$('input[name=callback]').val()+'&type='+type
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
    xhr.send(body)
    xhr.onload=function(){
      if(xhr.status==200){
        $('form').after('<div class="jumbotron text-center text-white bg-secondary">'+
          '<h3>Register Successful!</h3>'+
          '<p>Now go to your email to receive app id and the associated credentials.</p>'+
        '</div>')
        $('form').remove()
      }else if(xhr.status==303){
        alert('The name or the uri has already been registered. Check with your colleague and retry.')
      }else if(xhr.status==500){
        alert('Server encountered an internal error.')
      }else{
        alert('Unknown error occurred in server. Contact the maintainer for help.')
      }
    }
    xhr.onerror=function(){
      alert('Failed to submit the form. Try another time.')
    }
  })
})
