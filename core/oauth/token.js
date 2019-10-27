const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const {hash,decode,encode}=require(path.resolve(global.basedir,'core','util','encrypt.js'))

/* 1: invalid request
 * 2: invalid client
 * 3: invalid grant
 * 4: invalid scope
 * 5: unauthorized authorisation method
 * 6: unsupported grant type
 */
module.exports=function(req.res.next){
  const client_id=req.query.client_id
  const client_secret=req.query.client_secret
  const grant_type=req.query.grant_type
  const code=req.query.code
  const redirect_uri=req.query.redirect_uri

  return checkRequest()
  .then(checkCode)
  .then(issueToken)
  .catch(handleError)

  function checkRequest(){
    const supported_types=['authorization_token','refresh_token']
    if(!(client_id>=0&&client_secret))
      return Promise.reject(1)
    if(grant_type==supported_types[0])
      return Promise.resolve(1)
    else if(grant_type==supported_types[1])
      return Promise.resolve(2)
    else
      return Promise.reject(6)
  }

  function checkCode(flag){
    if(flag==1)
      return decode(code)
      .then(obj=>{
        if(obj.grant_type=='code')
          return obj
        else
          return Promise.reject(6)
      })
    else if(flag==2)
      return decode(code)
      .then(obj=>{
        const {old,type}=obj
        if(!(obj&&old&&type=='refresh_token'))
          return Promise.reject(3)
        return decode(old)
        .then(obj=>{
          const {iat,exp,nbf,iss}=obj
          if(!(obj&&iat&&exp&&nbf&&iss=='xiao\'s'&&nbf<new Date().getTime()/1000&&iat+exp<new Date().getTime()/1000))
            return Promise.reject(3)
          return obj
        })
      })
  }

  function issueToken(obj){
    obj.iss='xiao\'s'
    obj.sub=obj.type
    delete obj.type
    obj.aud='client'
    obj.nbf=new Date().getTime()/1000
    obj.exp=24*3600
    obj.iat=new Date().getTime()/1000
    return encode(obj)
    .then(jwt=>{
      res.body={
        access_token:jwt,
        token_type:'bearer',
        expires_in:obj.exp,
        scope:obj.scope,
        uid:obj.rowid,
        info:{
          name:obj.username,
          email:obj.email
        }
      }
      return {
        old:jwt,
        type:'refresh_token'
      }
    })
    .then(encode)
    .then(jwt=>{
      res.body.refresh_token=jwt
      res.status(200)
      return next()
    })
  }

  function handleError(flag){
    if(flag==0)
      return Promise.resolve()
    else
      return next({code:flag})
  }
}
