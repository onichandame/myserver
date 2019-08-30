$(document).ready(function(){
  // Format
  $('input[name=username]').after('<p>*</p>')
  $('input[name=password]').after('<p>*</p>')
  $('input[name=confirm]').after('<p>*</p>')
  $('input[name=email]').after('<p>*</p>')
  var popper=new Popper($('input[name=username]'),$('input[name=username]~p'),{placement:'left'})
  var popper=new Popper($('input[name=password]'),$('input[name=password]~p'),{placement:'left'})
  var popper=new Popper($('input[name=confirm]'),$('input[name=confirm]~p'),{placement:'left'})
  var popper=new Popper($('input[name=email]'),$('input[name=email]~p'),{placement:'left'})
  $('input[name=username]').change(function(){
    if($('input[name=username]').val().length<7){
      $('#submit').attr('disabled',true)
      if($('input[name=username]~p').length<2){
        $('input[name=username]').after('<p>At least 6 characters</p>')
        var popper=new Popper($('input[name=username]'),$('input[name=username]~p'),{placement:'right'})
      }
    }else{
      if($('input[name=username]~p').length>1)
        $('input[name=username]~p:first').remove()
      if(invalidateFields())
        $('#submit').attr('disabled',false)
    }
  })
  $('input[name=password]').change(function(){
    if($('input[name=password]').val().length<7){
      $('#submit').attr('disabled',true)
      if($('input[name=password]~p').length<2){
        $('input[name=username]').after('<p>At least 6 characters</p>')
        var popper=new Popper($('input[name=password]'),$('input[name=password]~p'),{placement:'right'})
      }
    }else{
      if($('input[name=passowrd]~p').length>1)
        $('input[name=password]~p:first').remove()
      if(invalidateFields())
        $('#submit').attr('disabled',false)
    }
  })
  $('input[name=confirm]').change(function(){
    if($('input[name=confirm]').val()!=$('input[name=password]').val()){
      $('#submit').attr('disabled',true)
      if($('input[name=confirm]~p').length<2){
        $('input[name=confirm]').after('<p>Passwords does not match</p>')
        var popper=new Popper($('input[name=confirm]'),$('input[name=confirm]~p'),{placement:'right'})
      }
    }else{
      if($('input[name=confirm]~p').length>1)
        $('input[name=confirm]~p:first').remove()
      if(invalidateFields())
        $('#submit').attr('disabled',false)
    }
  })
  $('input[name=email]').change(function(){
    if(!$('input[name=email]').val().includes('@')){
      $('#submit').attr('disabled',true)
      if($('input[name=email]~p').length<2){
        $('input[name=email]').after('<p>Invalid email</p>')
        var popper=new Popper($('input[name=email]'),$('input[name=email]~p'),{placement:'right'})
      }
    }else{
      if($('input[name=email]~p').length>1)
        $('input[name=email]~p:first').remove()
      if(invalidateFields())
        $('#submit').attr('disabled',false)
    }
  })

  // Submission
  $('button').click(function(){
    const uri=[document.location.protocol, '//', document.location.host, document.location.pathname].join('');
    let xhr=new XmlHttpRequest()
    xhr.open('OPEN',uri)
    xhr.setRequestHeader('Content-Type','application/json')
    const form=$('form').serializeArray()
    let body={}
    form.forEach((item,index)=>{
      body.(item.name)=item.value
    })
    xhr.send(JSON.stringify(body))
    xhr.onload=function(){
      if(xhr.status==200){
        $('form').after('<div class="jumbotron text-center text-white bg-secondary">'+
          '<h3>Register Successful!</h3>'+
          '<p>Redirecting to homepage in 3 sec</p>'+
        '</div>')
        $('form').remove()
        setTimeout(function(){
          window.location.href='/'
        },3000)
      }else if(xhr.status==409){
        alert('The username has already been registered. Try another one.')
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
  if($('input[name=password]').length&&$('input[name=password]').val().length<7)
    return false
  if($('input[name=email]').length&&!$('input[name=email]').val().includes('@'))
    return false
  if($('input[name=confirm]').length&&$('input[name=confirm]').val()!=$('input[name=password]').val())
    return false
  return true
}
