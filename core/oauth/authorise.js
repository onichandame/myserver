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

/* validate and process auth request step by step
 * returns code or token based on request
 * 0: already finished
 * 1: invalide request
 * 2: invalid client
 * 3: invalid grant
 * 4: invalid scope
 * 5: unauthorized authorisation method
 * 6: unsupported grant type
 */
module.exports=function(req,res,next){
  const {response_type,client_id,redirect_uri,scope}=req.query

  if(req.method=='GET'){
    return checkRequest()
    .then(checkClient)
    .then(login)
    .catch(handleError)

    function login(){
      if(!(req.method=='GET'))
        return next({code:405})
      res.status(200)
      res.page=path.resolve('oauth','login.pug')
      return next()
    }
  //handle login post
  }else if(req.method=='POST'){
    const {email,password}=req.body
    return checkRequest()
    .then(checkClient)
    .then(reply)
    .catch(handleError)

    function reply(){
      return select('TableUser',['type','email','password','username','active','rowid AS uid'],'email=\''+email+'\'')
      .then(userExists)
      .then(authenticate)
      .then(issue)

      function userExists(rows){
        if(!rows.length)
          return Promise.reject(3)
        return rows[0]
      }

      function authenticate(row){
        if(!row.active)
          return Promise.reject(3)
        return hash(password)
        .then(h=>{
          if(h!=row.password)
            return Promise.reject(3)
          delete row.password
          delete row.active
          switch(row.type){
            case 1:
              row.type='native'
              break
            default:
              row.type='web'
              break
          }
          row.cid=client_id
          row.iat=new Date().getTime()/1000
          row.scope=scope
          return row
        })
      }

      function issue(obj){
        delete obj.type
        if(response_type=='code'){
          obj.grant_type=response_type
          return encode(obj)
          .then(jwt=>{
            res.body=jwt
            res.status(301)
            res.set('Location',redirect_uri+'?code='+jwt)
            return next()
          })
        }else if(response_type=='token'){
          obj.exp=3600
          return encode(obj)
          .then(jwt=>{
            res.status(301)
            res.set('Location',redirect_uri+'#'+jwt)
            return next()
          })
        }else{
          return Promise.reject(6)
        }
      }
    }
  }else{
    return next({code:405})
  }

  function checkRequest(){
    const supported_types=['token','code']
    const supported_scopes=['read','write']
    if(!(redirect_uri&&supported_types.indexOf(response_type)>=0&&client_id>=0&&supported_scopes.indexOf(scope)>=0))
      return Promise.reject(1)
    return Promise.resolve()
  }

  function checkClient(){
    return select('TableApp',['permission,redirect_uri'],'rowid='+client_id)
    .then(rows=>{
      if(rows.length<1)
        return Promise.reject(2)
      switch(scope){
        case 'read':
          scope=1
          break
        case 'write':
          scope=2
          break
      }
      if(rows[0].permission<scope)
        return Promise.reject(4)
      if(rows[0].redirect_uri!=redirect_uri)
        return Promise.reject(3)
      return Promise.resolve()
    })
  }

  function handleError(flag){
    if(flag==0)
      return Promise.resolve()
    else
      return next({code:flag})
  }


}