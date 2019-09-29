$(document).ready(function(){
  const filepro='projects.json'
  let xhr=new XMLHttpRequest()
  xhr.open('GET','/'+filepro)
  xhr.send()
  xhr.onload=function(){
    if(xhr.status==200)
      updatepro(xhr.responseText)
  }
})
function updatepro(str){
  try{
    var pro=JSON.parse(str)
    pro.forEach((item)=>{
      $('.grid').append(additem(item))
    })
  }catch(e){
  }
}
function additem(pro){
  return '<li class="col-xs-12 col-lg-6 justify-content-center"><a class="nav-link card mx-auto" href="'+pro.link+'"><img class="card-img-top mx-auto" src="'+pro.icon+'"><div class="card-body"><h5 class="card-title">'+pro.title+'</h5><p class="card-text">'+pro.desc+'</p></div></a></li>'
}
