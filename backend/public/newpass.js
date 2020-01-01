var valid={pass:false,
  confirm:false}
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
      $('.pass').after('<p>6-16 characters and at least 1 digit and 1 special character.</p>')
      var popper=new Popper($('.pass'),$('.pass~p'),{placement:'right'})
    }
  }else{
    if($('.pass~p').length>0){
      $('.pass~p').remove()
    }
  }
  // confirm field
  flag=valid.confirm
  if(!flag){
    if($('.confirm~p').length<1){
      $('.confirm').after('<p>this field needs to match the previous field</p>')
      var popper=new Popper($('.confirm'),$('.confirm~p'),{placement:'right'})
    }
  }else{
    if($('.confirm~p').length>0){
      $('.confirm~p').remove()
    }
  }
}
function checkPass(){
  var regex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
  if(regex.test($('input[name=pass]').val()))
    valid.pass=true
  else
    valid.pass=false
}
function checkConfirm(){
  if($('input[name=confirm]').val()==$('input[name=pass]').val())
    valid.confirm=true
  else
    valid.confirm=false
}
function checkBoth(){
  checkPass()
  checkConfirm()
  update()
}
$(document).ready(function(){
  $('input[name=pass]').change(function(){
    checkBoth()
  })
  $('input[name=confirm]').change(function(){
    checkBoth()
  })

  // Submission
  $('#submit').click(function(){
    $('#submit').attr('disabled',true)
    let xhr=new XMLHttpRequest()
    xhr.open('POST','')
    var body='pass='+$('input[name=pass]').val()
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
    xhr.send(body)
    xhr.onload=function(){
      if(xhr.status==200){
        alert('200: Password change ok')
        $('form').after('<div class="jumbotron text-center text-white bg-secondary">'+
          '<h3>Password successfully set!</h3>'+
          '<p>Redirecting to login page in 3 seconds...</p>'+
        '</div>')
        $('form').remove()
        setTimeout(()=>{
          window.location.replace(xhr.getResponseHeader('Locationn'))
        },3000)
      }else if(xhr.status==422){
        alert('The password submitted does not satisfy requirement.\n1. 6-16 characters long\n2. contains atleast 1 digit and 1 special character')
      }else if(xhr.status==500){
        alert('Server encountered an internal error.')
      }else if(xhr.status==401){
        alert('Input valid! Refresh page or open it again from email')
      }else{
        alert('Unknown error occurred during transmission. Contact the maintainer for help.')
      }
    }
    xhr.onerror=function(){
      alert('Failed to submit the form. Try another time.')
    }
  })
})
