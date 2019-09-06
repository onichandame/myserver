var valid={pass:false,
  confirm:false}
function update(){
  var flag=true
  for(var i in valid){
    if(!i)
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
      $('.pass').after('<p>password needs to be 6 to 16 characters long and have at least 1 digit and 1 special character.</p>')
      var popper=new Popper($('.pass~p'),$('.pass'),{placement:'right'})
    }
  }else{
    if($('.pass~p').length>0){
      $('.pass~p').remove()
    }
  }
  // confirm field
  flag=!(valid.given_name&&valid.family_name)
  if(!flag){
    if($('.confirm~p').length<1){
      $('.confirm').after('<p>this field needs to match the previous field</p>')
      var popper=new Popper($('.confirm~p'),$('.confirm'),{placement:'right'})
    }
  }else{
    if($('.confirm~p').length>0){
      $('.confirm~p').remove()
    }
  }
}
$(document).ready(function(){
  $('input[name=pass]').change(function(){
    var regex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
    if(!regex.test($('.pass').val()))
      valid.pass=false
    else
      valid.pass=true
    update()
  })
  $('input[name=confirm]').change(function(){
    if(!($('input[name=confirm]').val()!=$('input[name=pass]').val()))
      valid.confirm=false
    else
      valid.confirm=true
  })

  // Submission
  $('#submit').click(function(){
    let xhr=new XMLHttpRequest()
    xhr.open('POST','')
    const form=$('form').serializeArray()
    var body=''
    form.forEach((item,index)=>{
      if(item.name=='pass')
        body+=item.name+'='+item.value
    })
    xhr.send(body)
    xhr.onload=function(){
      if(xhr.status==200){
        $('form').after('<div class="jumbotron text-center text-white bg-secondary">'+
          '<h3>Password successfully set!</h3>'+
          '<p>Now you can log in using your newly created account.</p>'+
        '</div>')
        $('form').remove()
      }else if(xhr.status==422){
        alert('The password submitted does not satisfy requirement.\n1. 6-16 characters long\n2. contains atleast 1 digit and 1 special character')
      }else if(xhr.status==500){
        alert('Server encountered an internal error.')
      }else{
        alert('Unknown error occurred during transmission. Contact the maintainer for help.')
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
