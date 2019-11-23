const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const checkToken=require(path.resolve(__dirname,'common','checkToken.js'))

module.exports=function(req,res,next){
  const id=req.body.id

  return checkToken(req)
  .catch(()=>{return Promise.reject(1)})
  .then(validateUser)
  .then(validateToken)
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
      if(!row.permission) return Promise.reject(2)
      return token
    })
  }

  function validateToken(token){
    const scope=token.scope
    let s=0
    switch(scope){
      case 'read':
        s=1
        break
      case 'write':
        s=2
        break
      default:
        break
    }
    if(s<2) return Promise.reject(3)
    return Promise.resolve(token)
  }

  function finalize(token){
    if(!Number.isInteger(id)) return Promise.reject(4)
    return select('TableUser',['permission'],'rowid='+id)
    .then(rows=>{
      if(rows.length<1) return Promise.reject(4)
      const row=rows[0]
      if(!row[permission]) return Promise.reject(2)
    })
    .then(()=>{
      return drop('TableUser','rowid='+id)
      .catch(e=>{return Promise.reject(4)})
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
          error:'unauthorised token',
          error_description:'The token received was not authorised for this request'
        }
        break
      case 4:
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
