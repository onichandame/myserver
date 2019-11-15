const path=require('path')
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const checkToken=require(path.resolve(__dirname,'common','checkToken.js'))

module.exports=function(req,res,next)
{
  const {response_type,client_id,redirect_uri,scope}=req.query

  return checkToken(req)
  .catch(()=>{return Promise.reject(1)})
  .then(finalize)
  .catch(handleError)
  .then(reply)

  function finalize(token)
  {
    return select('TableApp',['rowid'],'rowid='+token.cid)
    .then(rows=>{
      if(rows.length<1) return Promise.reject(1)
    })
    .then(()=>{
      return select('TableUser',['username','email','created_at','active','permission'],'rowid='+row.uid)
      .then(rows=>{
        if(rows.length<1) return Promise.reject(2)
        res.body=rows[0]
        res.status(200)
        res.type('application/json')
      })
    })
  }

  function handleError(flag)
  {
    res.status(400)
    switch(flag){
      case 1:
        res.body={
          error:'invalid token',
          error_description:'token cannot be validated'
        }
        break
      case 2:
        res.body={
          error:'operation failed',
          error_description:'the request was not finished as an unknown operation failed'
        }
        break
      default:
        res.status(500)
        break
    }
    return Promise.resolve()
  }

  function reply()
  {
    if(!res.statusCode) res.status(500)
    if(res.page) res.render(res.page)
    else if(res.body) res.send(res.body)
    else res.send()
    return Promise.resolve(res)
  }
}
