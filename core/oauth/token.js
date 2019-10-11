const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const {hash,decode,encode}=require(path.resolve(global.basedir,'core','util','encrypt.js'))

/* 1: invalide request
 * 2: invalid client
 * 3: invalid grant
 * 4: invalid scope
 * 5: unauthorized authorisation method
 * 6: unsupported grant type
 */
module.exports=function(req.res.next){
  const {client_id,client_secret,grant_type,code,redirect_uri}=req.query
  const {refresh_token}=req.query
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
    return checkGrant()
    .then()
    function checkGrant(){
      if(flag==1)
        return
    }
    .then(decode(code))
    .then(obj=>{
      if(!(obj&&obj.grant_type==1&&obj.info))
        return Promise.reject(3)
      return obj.info
    })
    .then(obj=>{
      if(!(obj.cid==client_id&&new Date().getTime()/1000<obj.iat+3600&&obj.scope))
        return Promise.reject(3)
      return select('TableApp',['redirect_uri','secret'],'rowid='+client_id)
      .then(rows=>{
        if(!rows.length)
          return Promise.reject(2)
        if(!(rows[0].redirect_uri==redirect_uri&&rows[0].secret==secret))
          return Promise.reject(2)
        return obj
      })
    })
    .then(issue)
  }

  function issueToken(obj){
    obj.iss='xiao\'s'
    obj.sub='web'
    obj.aud='client'
    obj.nbf=new Date().getTime()/1000
    obj.exp=24*3600
    obj.iat=new Date().getTime()/1000
    return encode(obj)
    .then(async (jwt)=>{
      res.status(200)
      let ref={}
      ref.old=obj
      ref.exp=3600
      res.body={
        access_token:jwt,
        token_type:'bearer',
        expires_in:obj.exp,
        refresh_token:await encode(ref),
        scope:obj.scope,
        uid:obj.rowid,
        info:{
          name:obj.username,
          email:obj.email
        }
      }
      return next()
    })
  }
}
