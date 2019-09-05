var valid={address:false,
  postfix:false,
  given_name:false,
  family_name:false}
var order=0
function update(){
  var flag=true
  for(var i in valid){
    if(!i)
      flag=false
  }
  // update button
  if(!flag)
    $('#submit').attr('disabled',true)
  else
    $('#submit').attr('disabled',false)
  // update warning message
  // email field
  flag=!(valid.address&&valid.posifix)
  if(!flag){
    if($('.email~p').length<1){
      $('.email').after('<p>invalid email address</p>')
      var popper=new Popper($('.email~p'),$('.email'),{placement:'right'})
    }
  }else{
    if($('.email~p').length>0){
      $('.email~p').remove()
    }
  }
  // name field
  flag=!(valid.given_name&&valid.family_name)
  if(!flag){
    if($('.name~p').length<1){
      $('.name').after('<p>invalid name</p>')
      var popper=new Popper($('.name~p'),$('.name'),{placement:'right'})
    }
  }else{
    if($('.name~p').length>0){
      $('.name~p').remove()
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
  })
  $('input[name=given_name]').change(function(){
    if($('input[name=given_name]').val().length<1)
      valid.given_name=false
    else
      valid.given_name=true
  })
  $('input[name=family_name]').change(function(){
    if($('input[name=family_name]').val().length<1)
      valid.family_name=false
    else
      valid.family_name=true
  })

  // name order
  $('.swap').click(function(){
    if(order){
      order=0
      $('input[name=given_name').insertAfter($('input[name=family_name'))
      $('input[name=family_name').insertAfter($('.swap'))
    }else{
      order=1
      $('input[name=family_name').insertAfter($('input[name=given_name'))
      $('input[name=given_name').insertAfter($('.swap'))
    }
  })

  // Submission
  $('#submit').click(function(){
    const uri=[document.location.protocol, '//', document.location.host, document.location.pathname].join('');
    let xhr=new XmlHttpRequest()
    xhr.open('POST',uri)
    const form=$('form').serializeArray()
    let body=''
    let email=''
    form.forEach((item,index)=>{
      if(item.name=='address')
        email=item.value+email
      else if(item.name=='postfix')
        email=email+'@'+item.value
      else
        body+=item.name+'='+item.value+'&'
    })
    body+='email='+email
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
function invalidateFields(){
  if($('input[name=username]').length&&$('input[name=username]').val().length<7)
    return false
  if($('input[name=email]').length&&!$('input[name=email]').val().includes('@'))
    return false
  return true
}
