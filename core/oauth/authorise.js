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
 * 1: invalide client
 * 2: invalid scope
 * 3: invalid credentials
 * 4: unauthorized authorisation method
 * 5: unsupported grant type
 */
module.exports=function(req,res,next)
{
  const {response_type,client_id,redirect_uri,scope}=req.query

  return checkClient()
  then(checkRequest)
  .then(handleRequest)
  .catch(handleError)
  .then(reply)

  function checkClient()
  {
    return select('TableApp',['type','permission','redirect_uri'],'rowid='+client_id)
    .then(rows=>{
      if(rows.length<1)
        return Promise.reject(1)
      let s=0;
      switch(scope){
        case 'read':
          s=1
          break
        case 'write':
          s=2
          break
        default:
          return Promise.reject(2)
          break
      }
      let row=rows[0]
      if(row.permission<s)
        return Promise.reject(2)
      if(response_type=='code' && row.redirect_uri!=redirect_uri)
        return Promise.reject(1)
      if(response_type=='token' && row.type!=0)
        return Promise.reject(5)
      return Promise.resolve()
    })
  }

  function handleRequest()
  {
    if(req.method=='GET'){
      return new Promise((resolve,reject)=>{
        res.status(200)
        res.page=path.resolve('oauth','login.pug')
        return resolve()
      })
    }else if(req.method=='POST'){

      const {email,password}=req.body

      return select('TableUser',['email','password',,'active','rowid AS id'],'email=\''+email+'\'')
      .then(validateUser)
      .then(issue)
      .then(finalize)

      function validateUser(rows){
        if(!rows.length)
          return Promise.reject(3)
        let row=rows[0]
        if(!row.active)
          return Promise.reject(3)
        return hash(password)
        .then(p=>{
          if(h==row.password)
            return row
          else
            return Promise.reject(3)
        })
      }

      function issue(row){
        let code={
          uid:row.id,
          iat:new Date().getTime()/1000,
          cid:client_id,
          scope:scope
        }
        switch(response_type){
          case 'token':
            code.exp=3600*24
            break
          case 'code':
            code.type='bearer'
            break
          default:
            return Promise.reject(5)
            break
        }
        return Promise.resolve(code)
      }

      function finalize(code)
      {
        return encode(code)
        .then(jwt=>{
          switch(response_type){
            case 'token':
              res.status(301)
              res.set('Location',redirect_uri+'#'+jwt)
              break
            case 'code':
              res.status(301)
              res.set('Location',redirect_uri+'?code='+jwt)
              break
            default:
              return Promise.reject(5)
              break
          }
          return
        })
      }
    }else{
      res.status(405)
      return Promise.resolve()
    }
  }

  function handleError(flag)
  {
    res.status(400)
    switch(flag){
      case 1:
        res.body={
          error:'invalid client',
          error_description:'client cannot be identified. details will be provided in future versions'
        }
        break
      case 2:
        res.body={
          error:'invalid scope',
          error_description:'the required scope is not accessible by the client which raised the request'
        }
        break
      case 3:
        res.body={
          error:'invalid credentials',
          error_description:'the email or password provided do not point to a valid user'
        }
        break
      case 4:
        res.body={
          error:'unauthorised authorizatoin method',
          error_description:'the requested authorisation method is not supported or authorised'
        }
        break
      case 5:
        res.body={
          error:'unsupported grant type',
          error_description:'the grant type requested is not supported'
        }
        break
      default:
        res.status(500)
        break
    }
    return Promise.resolve()
  }

  function reply()
  {
    if(!res.statusCode)
      res.status(500)
    if(res.page)
      res.render(res.page)
    else if(res.body)
      res.send(res.body)
    else
      res.send()
    return Promise.resolve(res)
  }
}
