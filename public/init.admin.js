$(document).ready(function(){
  $('input[name=name]').change(function(){
    if($('input[name=name]').val().length<3)
      valid.name=false 
    else 
      valid.name=true
    update()
  })
  $('input[name=callback]').change(function(){
    if($('input[name=callback]').val().length<3)
      valid.name=false 
    else 
      valid.name=true
    update()
  })
  $('input[type=radio]').change(function(){
    const button=$('input[type=radio]:checked')
    if(button)
      valid.type=true
    else 
      valid.type=false
  })
  $('#submit').click(function(){
    let xhr=new XMLHttpRequest()
    xhr.open('POST',window.location.pathname+'?admin')
    const name=$('input[name=name]').val()
    const callback=$('input[name=callback]').val()
    const type=$('input[type=radio]:checked').val()
    var body='name='+name+'&callback='+callback+'&type='+type
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded')
    xhr.send(body)
    xhr.onload=function(){
      if(xhr.status==200){
        $('form').after('<div class="jumbotron text-center text-white bg-secondary">'+
          '<h3>Register Successful!</h3>'+
          '<p>Now the app you registered can be used to manage user data!</p>'+
        '</div>')
        $('form').remove()
      }else{
        alert('Unknown error occurred in server. Contact the maintainer for help.')
      }
    }
    xhr.onerror=function(){
      alert('Failed to submit the form. Try another time.')
    }
  })
})
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
  // name field
  flag=valid.name
  if(!flag){
    if($('.name~p').length<1){
      $('.name').after('<p>App name must be at least 3 characters long.</p>')
      var popper=new Popper($('.name~p'),$('.name'),{placement:'right'})
    }
  }else{
    if($('.name~p').length>0){
      $('.name~p').remove()
    }
  }
  // callback field
  flag=!(valid.given_name&&valid.family_name)
  if(!flag){
    if($('.calback~p').length<1){
      $('.callback').after('<p>invalid url</p>')
      var popper=new Popper($('.callback~p'),$('.callback'),{placement:'right'})
    }
  }else{
    if($('.callback~p').length>0){
      $('.callback~p').remove()
    }
  }
}
var valid={name:false,
           callback:false,
           type:false
}
