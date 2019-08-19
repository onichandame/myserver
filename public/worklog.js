var meta={task:{dirty:false,
                aboutToUpdate:true,
                url:'tasklist'},
          log:{dirty:false,
               aboutToUpdate:true,
               url:'diary'}}

$(document).ready(function (){
  $(".selection .list-group-item").click(function(){
    $that=$(this)
    $that.parent().find('li').removeClass('active')
    $that.addClass('active')
  })
})
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
      const list=document.getElementById("tasklist")
      while(list.firstChild)
        list.removeChild(list.firstChild)
      var tasks=JSON.parse(xhr.response)
      if(tasks.length>1)
        tasks.sort((a,b)=>(a.importance > b.importance) ? -1 : (a.created_at<=b.created_at) ? -1 : 1)
      for(var i of tasks){
        var node=document.createElement("LI")
        var textnode=document.createTextNode(i.description)
        const className='list-group-item'
        node.appendChild(textnode)
        node.id=i.id
        node.className+=className
        list.appendChild(node)
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
      const list=document.getElementById("diary")
      while(list.firstChild)
        list.removeChild(list.firstChild)
      var logs=JSON.parse(xhr.response)
      if(logs.length>1)
        logs.sort((a,b)=>(a.committed_at > b.committed_at) ? -1 :1)
      for(var i of logs){
        var node=document.createElement("LI")
        var textnode=document.createTextNode(i.fulltext)
        const className='list-grout-item'
        node.appendChild(textnode)
        list.appendChild(node)
      }
    }
  }
  xhr.onerror=function(){
    alert("diary failed")
  }
}
function submit(){
  let comment=document.getElementById("inp").value 
  const id=document.getElementsByClassName("active").id
  let xhr=new XMLHttpRequest()
  xhr.open('POST',meta.log.url)
  let tar={id:id,
           comment:comment}
  xhr.send(JSON.stringify(tar))
  xhr.onload=function(){
    syncDiary()
  }
}
function create(){
  let description=document.getElementById("description").value 
  const selection=document.getElementById("importance")
  const importance=selection.options[selection.selectedIndex].value
  let xhr=new XMLHttpRequest()
  xhr.open('POST',meta.task.url)
  let tar={importance:importance,
           description:description}
  xhr.send(JSON.stringify(tar))
  xhr.onload=function(){
    syncTaskList()
  }
}
