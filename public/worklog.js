var meta={task:{dirty:false,
                aboutToUpdate:true,
                url:window.location.pathname+'/tasklist'},
          log:{dirty:false,
               aboutToUpdate:true,
               url:window.location.pathname+'/diary'}}

$(document).ready(function (){
  //click to activate or de-activate
  $(".selection .list-group-item").click(function(){
    $that=$(this)
    if($that.hasClass('active')){
      $that.removeClass('active')
    }else{
      $that.parent().find('li').removeClass('active')
      $that.addClass('active')
    }
  })

  //clock
  const monthNames=["January","February","March","April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const dayNames=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  var date=new Date()
  date.setDate(date.getDate())
  $('#date').html(dayNames[date.getDay()]+" "+date.getDate()+" "+monthNames[date.getMonth()]+' '+date.getFullYear())
  setInterval(()=>{
    var second=new Date().getSeconds()
    $('#seconds').html((second<10 ? "0" : "")+second)
  },1000)
  setInterval(()=>{
    var minute=new Date().getMinutes()
    $('#minutes').html((minute<10 ? "0" : "")+minute)
  },1000)
  setInterval(()=>{
    var hour=new Date().getHours()
    $('#hours').html((hour<10 ? "0" : "")+hour)
  },1000)
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
  xhr.responseType='text'
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
        node.id=i._id
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
  const id=$(".active").attr('id')
  if(id==null)
    return
  let xhr=new XMLHttpRequest()
  xhr.open('POST',meta.log.url)
  xhr.setRequestHeader('Content-Type','application/json')
  let tar={id:id,
           comment:comment}
  xhr.send(JSON.stringify(tar))
  xhr.onload=function(){
    syncDiary()
  }
  xhr.onerror=function(){
    alert("falied to submit")
  }
}
function create(){
  let description=document.getElementById("description").value 
  const selection=document.getElementById("importance")
  const importance=selection.options[selection.selectedIndex].value
  let xhr=new XMLHttpRequest()
  xhr.open('POST',meta.task.url)
  xhr.setRequestHeader('Content-Type','application/json')
  let tar={importance:importance,
           description:description}
  xhr.send(JSON.stringify(tar))
  xhr.onload=function(){
    if(xhr.status!=200)
      xhr.onerror()
    else
    syncTaskList()
  }
  xhr.onerror=function(){
    alert("failed to create! "+xhr.status)
  }
}
function conclude(){
  const comment=document.getElementById("cocl").value
  let xhr=new XMLHttpRequest()
  xhr.open('POST',meta.log.url)
  xhr.setRequestHeader('Content-Type','application/json')
  let tar={id:-1,
           comment:comment}
  xhr.send(JSON.stringify(tar))
  xhr.onload=function(){
    syncDiary()
  }
  xhr.onerror=function(){
    alert("failed to conclude")
  }
}
