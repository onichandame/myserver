var jwt=require('jsonwebtoken')

const getkey=require(path.resolve(__dirname,'getkey.js'))
const logger=require('..','logger','logger.js'))

module.exports=function(code){
  return getkey()
  .then(k=>{
    return jwt.verify(code,k,{algorithm:'HS256'})
  })
  .catch(logger.error)
}
