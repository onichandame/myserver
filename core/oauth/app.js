const path=require('path')
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const reply=require(path.resolve(global.basedir,'core','common','reply.js'))

module.exports=function(req,res,next)
{
  const id=req.query.id

  return checkRequest(req)
  .catch(()=>{return Promise.reject(1)})
  .then(finalize)
  .catch(handleError)
  .then(reply)
}
