var jwt=require('jsonwebtoken')

const getkey=require(path.resolve(__dirname,'getkey.js'))
const logger=require('..','logger','logger.js'))

module.exports=function(obj){
  return getkey()
  .then(k=>{
    return jwt.sign(obj,k,{algorithm:'HS256'})
  })
  .catch(logger.error)
}
