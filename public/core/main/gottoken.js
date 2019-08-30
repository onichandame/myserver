$(document).ready(function(){
  var tok=window.location.hash.substr(1)
  if(tok){
    let xhr=new XMLHttpRequest()
    xhr.open('OPEN',window.location.origin+'/request')
    xhr.setRequestHeader('Content-Type','application/json')
    xhr.send(JSON.stringify({tok:tok}))
    xhr.onload=function(){
    }
  }else{
    document.location.href='/'
  }
})
