const file='experience.json'
$(document).ready(function(){
  let xhr=new XMLHttpRequest()
  xhr.open('GET','/'+file)
  xhr.send()
  xhr.onload=function(){
    if(xhr.status==200)
      update(xhr.responseText)
  }
})
function update(str){
  try{
    var exp=JSON.parse(str)
    exp.forEach((item)=>{
      $('#experience').append('<h5>'+item.title+', '+item.corp+'</h5>')
      $('#experience').append('<p>'+item.desc+'</p>')
      $('#experience').append('<ul></ul>')
      $('#experience').append('<ul>Achievements</ul>')
      item.achievements.forEach((exp)=>{
        $('#experience ul:last-child').append('<li>'+exp+'</li>')
      })
    })
  }catch(e){
  }
}
