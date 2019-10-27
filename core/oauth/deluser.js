const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const checkClient=require(path.resolve(__dirname,'common','checkClient.js'))

module.exports=function(req,res,next){
  const client_id=req.query.client_id
  const secret=req.query.secret
  const uid=req.body.uid
  const token=req.cookies.token

  return checkRequest()
  .then(checkBody)
  .then(checkClient)
  .then(checkToken)
  .then(finalize)
  .catch(handleError)

  function checkRequest(){
    if(req.query&&client_id&&client_id>=0&&secret)
      return Promise.resolve()
    return Promise.reject(1)
  }

  function checkBody(){
    if(req.body&&uid&&uid>=0&&token)
      return Promise.resolve()
    return Promise.reject(1)
  }
}
