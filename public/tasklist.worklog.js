var task={dirty:false,
          aboutToUpdate:true,
          url:'/app/worklog/tasklist'}
send(task.url,(res)=>{
  JSON.parse(res)
})
function send(url,callback){
  var req 
  if(window.ActiveXObject || "ActiveXObject" in window)
    req=new ActiveXObject("Microsoft.XMLHTTP")
  else if(window.XMLHttpRequest)
    req=new XMLHttpRequest()
  req.onreadystatechange=function(){
    req.responseType='text'
    if(req.readyState==4&&req.status=='200')
      if(callback)
        callback(req.response)
  }
  req.open("GET",url,true)
  req.send()
}
