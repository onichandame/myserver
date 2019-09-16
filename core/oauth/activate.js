const path=require('path')
const {decodeJWT}=require(path.resolve(__dirname,'..','util','encrypt.js'))
const {select,update}=require(path.resolve(__dirname,'..','util','db.js'))
module.exports=function(req,res,next){
  if(req.method=='GET'){
    const {code}=req.query
    decodeJWT(code,new Date()(result)=>{
      if(!result)
        return next({code:401})
      const {secret,uid,username}=result
      select('user',['password,username'],'rowid='+uid,(row)=>{
        if(!(username==row.username&&secret==row.password))
          return next({code:401})
        res.locals.page=path.resolve('email/newpass.pug')
      })
    })
  }else if(req.method=='POST'){
  }else{
    return next({code:405})
  }
}
