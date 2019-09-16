const path=require('path')
const {hash,decodeJWT}=require(path.resolve(__dirname,'..','util','encrypt.js'))
const {select,update}=require(path.resolve(__dirname,'..','util','db.js'))
module.exports=function(req,res,next){
  if(req.method=='GET'){
    const {code}=req.query
    decodeJWT(code,new Date(),(result)=>{
      if(!result)
        return next({code:401})
      const {secret,uid,username}=result
      select('user',['password,username'],'rowid='+uid,(row)=>{
        if(!(username==row.username&&secret==row.password))
          return next({code:401})
        res.locals.page=path.resolve('core/oauth/newpass.pug')
        res.status(301)
        return next()
      })
    })
  }else if(req.method=='POST'){
    const {pass}=req.body
    const {code}=req.query
    var regex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
    if(!regex.test(pass))
      return next({code:422})
    decodeJWT(code,new Date(),(result)=>{
      if(!result)
        return next({code:401})
      const {username,secret,uid}=result
      select('user',['password','username'],'rowid='+uid,(row)=>{
        if(!(username==row.username&&secret==row.password))
          return next({code:401})
        update('user',{password:hash(pass),active:1},'rowid='+uid,()=>{
          res.status(200)
          res.set('Location','/authenticate')
          return next()
        })
      })
    })
  }else{
    return next({code:405})
  }
}
