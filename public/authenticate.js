var valid={pass:false,
  email:false}
function update(){
  var flag=true
  for(var i in valid){
    if(!valid[i])
      flag=false
  }
  // update button
  if(flag)
    $('#submit').attr('disabled',false)
  else
    $('#submit').attr('disabled',true)
  // password field
  flag=valid.pass
  if(!flag){
    if($('.pass~p').length<1){
      $('.pass').after('<p>invalid password</p>')
      var popper=new Popper($('.pass'),$('.pass~p'),{placement:'right'})
    }
  }else{
    if($('.pass~p').length>0){
      $('.pass~p').remove()
    }
  }
  // email field
  flag=valid.email
  if(!flag){
    if($('.email~p').length<1){
      $('.email').after('<p>invalid email</p>')
      var popper=new Popper($('.email'),$('.email~p'),{placement:'right'})
    }
  }else{
    if($('.email~p').length>0){
      $('.email~p').remove()
    }
  }
}
$(document).ready(function(){
  $('input[name=pass]').change(function(){
    if($('input[name=pass]').val().length<3)
      valid.pass=false
    else
      valid.pass=true
    update()
  })
  $('input[name=email]').change(function(){
    if($('input[name=email]').val().includes('@'))
      valid.email=true
    else
      valid.email=false
    update()
  })

  // Submission
  $('#submit').click(function(){
    $('#submit').attr('disabled',true)
    let xhr=new XMLHttpRequest()
    xhr.open('POST','')
    const form=$('form').serializeArray()
    var body='pass='+$('input[name=pass]').val()+'&email='+$('input[name=email]').val()
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
    xhr.send(body)
    xhr.onload=function(){
      if(xhr.status==200){
        $('form').after('<div class="jumbotron text-center text-white bg-secondary">'+
          '<h3>Log in successful!</h3>'+
          '<p>Now you can access services on this site!</p>'+
        '</div>')
        $('form').remove()
      }else if(xhr.status==422){
        alert('The password submitted does not satisfy requirement.\n1. 6-16 characters long\n2. contains atleast 1 digit and 1 special character')
        $('#submit').attr('disabled',false)
      }else if(xhr.status==500){
        alert('Server encountered an internal error.')
        $('#submit').attr('disabled',false)
      }else if(xhr.status==401){
        alert('Wrong password. Correct it and try again')
        $('#submit').attr('disabled',false)
      }else if(xhr.status==404){
        alert('User not found. Correct it and try again')
        $('#submit').attr('disabled',false)
      }else if(xhr.status==303){
        window.location.replace(xhr.getResponseHeaders("Location"))
      }else{
        alert(xhr.status+': Unknown error occurred during transmission. Retry or contact the maintainer for help.')
        $('#submit').attr('disabled',false)
      }
    }
    xhr.onerror=function(){
      alert('Failed to submit the form. Try another time.')
    }
  })
})
