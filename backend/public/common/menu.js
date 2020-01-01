function resetMenu(p,m){
  if(!(p instanceof jQuery && m instanceof Object)) return Promise.reject()
  p.children('.dropdown-toggle').eq(0).text(m.text)
  p.children('.dropdown-toggle').eq(0).attr('href',m.href)
  updateMenu(p,m.menu)
}

function updateMenu(p,m){
  if(!(p instanceof jQuery && Array.isArray(m))) return Promise.reject()
  m.forEach(block=>{
    block.forEach(row=>{
      p.children('.dropdown-menu').eq(0).append(getHTML())

      function getHTML(){
        return `<a${getTags()}>${row.text}</a>`

        function getTags(){
          if(!row.class) row.class=[]
          if(!row.class.includes('dropdown-item')) row.class.push('dropdown-item')
          let result=''
          Object.keys(row).forEach(key=>{
            if(Array.isArray(row[key])) result+=`key="${row[key].join(' ')"`
            else if(typeof row[key]=='string' && key!='text') result+=` key="${row[key]}"`
          })
          return result
        }
      }
    })
    $('.user .dropdown-menu').append('<div class="dropdown-divider"></div>')
  })
  if(p.children('dropdown-menu').eq(0).children().length>0) p.children('dropdown-menu').eq(0).children().last().remove()
  return Promise.resolve()
}
