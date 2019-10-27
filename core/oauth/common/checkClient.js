const path=require('path')
const select=require(path.resolve(global.basedir,'core','db','select.js'))

module.exports=function(client){
  return select('TableApp',['redirect_uri','secret'],'rowid='+client.cid)
  .then(rows=>{
    if(!rows.length)
      return Promise.reject()
    let row=rows[0]
    if(client.redirect_uri && client.redirect_uri!=row.redirect_uri)
      return Promise.reject()
    else if(client.secret && client.secret!=row.secret)
      return Promise.reject()
    else
      return Promise.resolve()
  })
}
