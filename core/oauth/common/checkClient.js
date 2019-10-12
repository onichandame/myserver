const path=require('path')
const select=require(path.resolve(global.basedir,'core','db','select.js'))

module.exports=function(client){
  return select('TableApp',['redirect_uri','secret'],'rowid='+client.cid)
  .then(rows=>{
    if(!rows.length)
      return Promise.reject()
    if(client.redirect_uri)
      if(client.redirect_uri!=rows[0].redirect_uri)
        return Promise.reject()
    if(client.secret==rows[0].secret)
      return Promise.resolve()
    return Promise.reject()
  })
}
