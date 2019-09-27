$(document).ready(function(){
  const fileexp='experience.json'
  let xhr=new XMLHttpRequest()
  xhr.open('GET','/'+fileexp)
  xhr.send()
  xhr.onload=function(){
    if(xhr.status==200)
      updateexp(xhr.responseText)
  }
})
function updateexp(str){
  try{
    var exp=JSON.parse(str)
    exp.forEach((item)=>{
      $('#experience').append(addexp(item))
    })
  }catch(e){
  }
}
function addexp(item){
  var result='<h5>'+item.title+', '+item.corp+'</h5>'+
    '<p>'+item.desc+'</p>'+
    '<h5>Achievements</h5>'+
    '<ul>'
  item.achievements.forEach((exp)=>{
    result+='<li>'+exp+'</li>'
  })
  result+='</ul>'
  return result
}
