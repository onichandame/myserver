$(document).ready(function(){
  updateapp()
})

function updateapp(){
  const filename='apps.json'
  return getXHR('GET',`/${filename}`)
  .then(response=>{
    let menu=[]
    let block=[]
    response.forEach(app=>{
      block.push({
        text:app.title,
        href:app.link
      })
    })
    menu.push(block)
    return updateMenu($('.app'),menu)
  })
}
