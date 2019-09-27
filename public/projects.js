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
      $('#projects').append(additem(item))
    })
  }catch(e){
  }
}
function additem(pro){
  return '<a class="col-xs-12 col-lg-6 card" href="'+pro.link+'"><img class="card-img-top" src="'+pro.icon+'"><div class="card-body"><h5 class="card-title">'+pro.title+'</h5><p class="card-title">'+pro.desc+'</p></div></a>'
}
