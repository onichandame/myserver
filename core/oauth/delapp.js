const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const drop=require(path.resolve(global.basedir,'core','db','drop.js'))
const checkToken=require(path.resolve(__dirname,'common','checkToken.js'))

module.exports=function(req,res,next){
  const id=req.body.id

  return checkToken(req)
  .catch(()=>{return Promise.reject(1)})
  .then(validateUser)
  .then(finalize)
  .catch(handleError)
  .then(reply)

  function validateUser(token){
    const uid=token.uid
    if(!Number.isInteger(uid)) return Promise.reject()
    return select('TableUser',['permission'],'rowid='+uid)
    .then(rows=>{
      if(rows.length<1) return Promise.reject(2)
      const row=rows[0]
      if(row.permission>1) return Promise.reject(2)
      return token
    })
  }

  function finalize(token){
    if(!Number.isInteger(id)) return Promise.reject(4)
    return select('TableApp',['rowid'],'rowid='+id)
    .then(rows=>{
      if(rows.length<1) return Promise.reject(3)
    })
    .then(()=>{
      return drop('TableApp','rowid='+id)
      .catch(e=>{return Promise.reject(3)})
    })
  }

  function handleError(e){
    res.status(400)
    switch(e){
      case 1:
        res.body={
          error:'invalid token',
          error_description:'The token received did not pass validation'
        }
        break
      case 2:
        res.body={
          error:'unauthorised user',
          error_description:'The user did not pass validation'
        }
        break
      case 3:
        res.body={
          error:'operation failed',
          error_description:'The request was validated but the operation failed for unknown reasons'
        }
        break
      default:
        res.status(500)
        res.body={
          error:'unknwon error',
          error_description:'undefined error!'
        }
        break
    }
    return Promise.resolve()
  }

  function reply(){
    if(!res.statusCode) res.status(500)
    if(res.body) res.send(JSON.stringify(res.body))
    else if(res.page) res.render(page)
    else res.send()
    return Promise.resolve()
  }
}
