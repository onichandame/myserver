/* handles 2 methods:
 * 1. GET: displays login form
 * 2. POST: authenticate user and set cookies & sessions
 *
 * post-authenticate process varies based on response_type
 * 1. code: redirect_uri?code=***
 * 2. token: redirect_uri#token=***
 *
 * Roadmap:
 * 1. support more oauth type
 */
const path=require('path')
const randomstring=require('randomstring')
const {insert,select}=require(path.resolve(__dirname,'..','util','db.js'))
const {generateJWT,hash}=require(path.resolve(__dirname,'..','util','encrypt.js'))
module.exports=function(req,res,next){
  if(req.method=='GET'){
    res.status(200)
    res.render('core/oauth/authenticate.pug')
  }else if(req.method=='POST'){
    const {email,pass}=req.body
    const {response_type,client_id,redirect_uri,scope}=req.query
    var valid=false
    if(response_type=='code'){
      //Auth code flow
    }else if(response_type=='token'){
      //Implicit flow
    }else{
      //No oauth flow
      var info={}
      select('user',['rowid','password','email','username'],'email=\''+email+' OR username=\''+email+'\'',(row)=>{
        if(hash(pass)==row.password)
          if(!info){
            info.username=row.username
            info.email=row.email
            info.uid=row.rowid
          }else{
            if(row.email==email)
              info={email:row.email,username:row.username,uid:row.rowid}
          }
      },(num)=>{
        if(num<1)
          return next({code:401})
        generateJWT(info,(result)=>{
          if(!result)
            return next({code:500})
          var exp=new Date()
          exp.setSeconds(exp.getSeconds()+24*3600)
          res.cookie('sid',result,{path:'/',expires:exp})
          res.cookie('dat',new Date().getTime(),{path:'/',expires:exp})
          res.status(200)
          return next()
        })
      })
    }
  }else{
    next({code:405})
  }
}
