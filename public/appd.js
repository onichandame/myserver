$(document).ready(function(){
  updateapp()
})

function updateapp(){
  const filename='apps.json'
  return getXHR('GET',`/${filename}`)
  .then(response=>{
    response.forEach(app=>{
      let menu=[]
      $('.app .dropdown-menu').append(getHTML())

      function getHTML(){
        return '<a class="dropdown-item" href="'+app.link+'">'+app.title+'</a>'
      }
    })
  })
}
