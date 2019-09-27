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
    const parent=$('#projects').outerWidth()
    var current=parent
    pro.forEach((item)=>{
      if(current>=parent){
        $('#projects').append('<div class="row"></div>')
        current=0
      }
      $('#projects .row:last-child').append(additem(item))
      current+=$('#projects .row:last-child .card:last-child').outerWidth()
    })
  }catch(e){
  }
}
function additem(pro){
  return '<div class="col-xs-12 col-lg-6 justify-content-center"><a class="card" href="'+pro.link+'"><img class="card-img-top" src="'+pro.icon+'"><div class="card-body"><h5 class="card-title">'+pro.title+'</h5><p class="card-title">'+pro.desc+'</p></div></a></div>'
}
