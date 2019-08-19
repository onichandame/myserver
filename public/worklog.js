var meta={task:{dirty:false,
                aboutToUpdate:true,
                url:'tasklist'},
          log:{dirty:false,
               aboutToUpdate:true,
               url:'diary'}}

$(document).ready(function(){
    alert("1")
  $(".selection list-group-item").click(function(){
    $that=$(this)
    $that.parent().find('li').removeClass('active')
    $that.addClass('active')
  })
}
sync()
function sync(){
  syncTaskList()
  syncDiary()
}
function syncTaskList(){
  let xhr=new XMLHttpRequest()
  xhr.open('GET',meta.task.url,true)
  xhr.send()
  xhr.onload=function(){
    if(xhr.status!=200){
      alert('Error: '+xhr.status)
    }else{
      var tasks=JSON.parse(xhr.response)
      if(tasks.length>1)
        tasks.sort((a,b)=>(a.importance > b.importance) ? -1 : (a.created_at<=b.created_at) ? -1 : 1)
      for(var i of tasks){
        var node=document.createElement("LI")
        var textnode=document.createTextNode(i.description)
        const className='list-group-item'
        node.appendChild(textnode)
        node.className+=className
        document.getElementById('tasklist').appendChild(node)
      }
    }
  }
  xhr.onerror=function(){
    alert("tasklist failed")
  }
}
function syncDiary(){
  let xhr=new XMLHttpRequest()
  xhr.open('GET',meta.log.url,true)
  xhr.send()
  xhr.onload=function(){
    if(xhr.status!=200){
      alert('Error: '+xhr.status)
    }else{
      var logs=JSON.parse(xhr.response)
      if(logs.length>1)
        logs.sort((a,b)=>(a.committed_at > b.committed_at) ? -1 :1)
      for(var i of logs){
        var node=document.createElement("LI")
        var textnode=document.createTextNode(i.fulltext)
        const className='list-grout-item'
        node.appendChild(textnode)
        document.getElementById('diary').appendChild(node)
      }
    }
  }
  xhr.onerror=function(){
    alert("diary failed")
  }
}
function submit(){
  let comment=document.getElementById("inp").value 
  let xhr=new XMLHttpRequest()
  xhr.open('POST',)
}
