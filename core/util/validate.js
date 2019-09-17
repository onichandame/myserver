const path=require('path')
const {decodeJWT}=require(path.resolve(__dirname,'..','util','encrypt.js'))
module.exports=async function(sid,dat,callback){
  decodeJWT(sid,new Date(dat),(result)=>{
    const {username,email,uid}=result
    if(!(username&&uid&&email))
      return callback(false)
    else
      return callback(result)
  })
}
