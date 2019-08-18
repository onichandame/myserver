var meta={task:{dirty:false,
                aboutToUpdate:true,
                url:'/app/worklog/tasklist'}}

syncTaskList()
function syncTaskList(){
  send(meta.task.url,(res)=>{
    var tasks=JSON.parse(res)
    tasks.sort((a,b)=>(a.importance > b.importance) ? -1 : (a.created_at<=b.created_at) ? -1 : 1)
    for(var i of tasks){
      var node=document.createElement("LI")
      var textnode=document.createTextNode(i.description)
      const className='list-group-item'
      node.appendChild(textnode)
      node.className+=className
      document.getElementById('tasklist').appendChild(node)
    }
  })
}
function send(url,callback){
  alert(url)
  var req 
  if(window.ActiveXObject || "ActiveXObject" in window)
    req=new ActiveXObject("Microsoft.XMLHTTP")
  else if(window.XMLHttpRequest)
    req=new XMLHttpRequest()
  req.onreadystatechange=function(){
    req.responseType='text'
alert(req.readyState)
    if(req.readyState==4&&req.status=='200')
      if(callback)
        callback(req.response)
  }
  req.open("GET",url,true)
  req.send()
}
