var valid={address:false,
  postfix:false,
  username:false}
function update(){
  var flag=true
  for(const i in valid){
    if(!valid[i])
      flag=false
  }
  // update button
  if(flag)
    $('#submit').attr('disabled',false)
  else
    $('#submit').attr('disabled',true)
  // email field
  flag=valid.address&&valid.postfix
  if(flag){
    if($('.email~p').length>0){
      $('.email~p').remove()
    }
  }else{
    if($('.email~p').length<1){
      $('.email').after('<p>invalid email address</p>')
      var popper=new Popper($('.email'),$('.email~p'),{placement:'right'})
    }
  }
  // name field
  flag=valid.username
  if(flag){
    if($('.name~p').length>0){
      $('.name~p').remove()
    }
  }else{
    if($('.name~p').length<1){
      $('.name').after('<p>invalid name</p>')
      var popper=new Popper($('.name'),$('.name~p'),{placement:'right'})
    }
  }
}
$(document).ready(function(){
  $('input[name=address]').change(function(){
    if($('input[name=address]').val().length<1)
      valid.address=false
    else
      valid.address=true
    update()
  })
  $('input[name=postfix]').change(function(){
    if(!($('input[name=postfix]').val().includes('.')&&$('input[name=postfix]').val().length>1))
      valid.postfix=false
    else
      valid.postfix=true
    update()
  })
  $('input[name=username]').change(function(){
    if($('input[name=username]').val().length<1)
      valid.username=false
    else
      valid.username=true
    update()
  })

  // Submission
  $('#submit').click(function(){
    let xhr=new XMLHttpRequest()
    xhr.open('POST','')
    let email=$('input[name=address').val()+'@'+$('input[name=postfix]').val()
    let body='username='+$('input[name=username').val()+'&email='+email
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
    xhr.send(body)
    xhr.onload=function(){
      if(xhr.status==200){
        $('form').after('<div class="jumbotron text-center text-white bg-secondary">'+
          '<h3>Register Successful!</h3>'+
          '<p>Now go to your email for activation.</p>'+
        '</div>')
        $('form').remove()
      }else if(xhr.status==303){
        alert('The email has already been registered. Try another one.')
      }else if(xhr.status==500){
        alert(xhr.status+':Server encountered an internal error.')
      }else{
        alert('Unknown error occurred in server. Contact the maintainer for help.')
      }
    }
    xhr.onerror=function(){
      alert('Failed to submit the form. Try another time.')
    }
  })
})
