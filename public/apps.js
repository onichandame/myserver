$(document).ready(function(){
  const fileapp='apps.json'
  let xhr=new XMLHttpRequest()
  xhr.open('GET','/'+fileapp)
  xhr.send()
  xhr.onload=function(){
    if(xhr.status==200)
      updateapp(xhr.responseText)
  }
})
function updateapp(str){
  try{
    var app=JSON.parse(str)
    app.forEach((item)=>{
      $('.appps-list').append(addapp(item))
    })
  }catch(e){
  }
}
function addapp(item){
  return '<li class="col-xs-12 col-lg-6 justify-content-center"><a class="nav-link card mx-auto" href="'+item.link+'"><img class="card-img-top" src="'+item.icon+'"><div class="card-body"><h5 class="card-title">'+item.title+'</h5><p class="card-text">'+item.desc+'</p></div></a></li>'
}
