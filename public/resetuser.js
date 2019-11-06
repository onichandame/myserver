$(document).ready(function(){
  // Submission
  $('#submit').click(function(){
    $('#submit').attr('disabled',true)
    let xhr=new XMLHttpRequest()
    xhr.open('POST','')
    var body='email='+$('input[name=email]').val()
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
      }else{
        alert(xhr.responseText)
      }
    }
    xhr.onerror=function(){
      alert('Failed to submit the form. Try another time.')
    }
  })
})
