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
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const {hash,decode,encode}=require(path.resolve(global.basedir,'core','util','encrypt.js'))

module.exports=function(req,res,next){
  const {response_type,client_id,redirect_uri,scope}=req.query
  const {sid}=req.cookies
  return decode(sid)
  .then(checkSession)
  .then(login)
  .catch(checkClient)

  function login(){
    if(!(req.method=='GET'||'POST'))
      return next({code:405})
    res.status(200)
    return client_id ? select('TableApp',['permission','redirect_uri'],'rowid='+client_id)
    .then(rows=>{
      if(!rows.length)
        return Promise.reject(0)
      return rows[0]
    })
    .then(row=>{
      if(row.permission<scope)
        return new Promise.reject(1)
      return null
    })
    .then(()=>{
      res.status(302)
      res.set('Location')
      return
    })
    .catch(flag=>{
      if(flag==0)
        return next({code:404})
      else if(flag==1)
        return next({code:403})
    })
    : next()
  }

  function checkSession(obj){
    const {exp,iat}=obj
    if(new Date().getTime()/1000>exp+iat)
      return Promise.resolve()
    else
      return Promise.reject()
  }
  if(req.method=='GET'){
    res.status(200)
    res.page=path.resolve('oauth','authenticate.pug')
    return next()
  }else if(req.method=='POST'){
    const {email,password}=req.body
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
    return next({code:405})
  }
}
