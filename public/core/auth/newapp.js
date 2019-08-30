$(document).ready(function(){
  // Format
  $('input[name=appname]').after('<p>*</p>')
  $('input[name=url]').after('<p>*</p>')
  $('input[name=redirect]').after('<p>*</p>')
  $('input[name=email]').after('<p>*</p>')
  var popper=new Popper($('input[name=appname]'),$('input[name=appname]~p'),{placement:'left'})
  var popper=new Popper($('input[name=url]'),$('input[name=url]~p'),{placement:'left'})
  var popper=new Popper($('input[name=redirect]'),$('input[name=redirect]~p'),{placement:'left'})
  var popper=new Popper($('input[name=email]'),$('input[name=email]~p'),{placement:'left'})
  $('input[name=email]').change(function(){
    if(!$('input[name=email]').val().includes('@')){
      $('#submit').attr('disabled',true)
      if($('input[name=email]~p').length<2){
        $('input[name=email]').after('<p>Invalid email!</p>')
        var popper=new Popper($('input[name=email]'),$('input[name=email]~p'),{placement:'right'})
      }
    }else{
      if($('input[name=email]~p').length>1)
        $('input[name=email]~p:first').remove()
      if(invalidateFields())
        $('#submit').attr('disabled',false)
    }
  })
  $('input[name=appname]').change(function(){
    if($('input[name=appname]').val().length<1){
      $('#submit').attr('disabled',true)
      if($('input[name=appname]~p').length<2){
        $('input[name=appname]').after('<p>At least 1 character</p>')
        var popper=new Popper($('input[name=appname]'),$('input[name=appname]~p'),{placement:'right'})
      }
    }else{
      if($('input[name=appname]~p').length>1)
        $('input[name=appname]~p:first').remove()
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
          '<h3>Application Submitted!</h3>'+
          '<p>Redirecting to homepage in 3 sec</p>'+
        '</div>')
        $('form').remove()
        setTimeout(function(){
          window.location.href='/'
        },3000)
      }else if(xhr.status==409){
        alert('The name has already been registered or used in am application. Try another one.')
      }else if(xhr.status==500){
        alert('Server encountered an internal error.')
      }else{
        alert('Unknown error occurred in server. Contact the maintainer for help.')
      }
    }
    xhr.onerror=function(){
      alert('Failed to submit. Try another time')
    }
  })
})

function invalidateFields(){
  if($('input[name=appname]').length&&$('input[name=appname]').val().length>0)
    return false
  if(!$('input[name=email]').length&&$('input[name=email]').val().includes('@'))
    return false
  return true
}
