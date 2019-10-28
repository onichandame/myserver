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
  .then(reply)

  function checkRequest(){
    return checkClient()
    .then(checkGrantType)

    function checkClient()
    {
      return hash(client_secret)
      .then(s=>{
        if(!s) return Promise.reject(2)
        return select('TableApp',['secret AS s','redirect_uri AS uri'],'rowid='+client_id)
      })
      .then(rows=>{
        if(!rows.length) return Promise.reject(2)
        const row=rows[0]
        if(row.s!=s) return Promise.reject(2)
        return row
      })
    }

    function checkGrantType(row)
    {
      if(grant_type=='authorization_token'){
        if(row.uri!=redirect_uri) return Promise.reject(2)
      }else if(grant_type=='refresh_token'){
      }else{
        return Promise.reject(3)
      }
      return Promise.resolve()
    }
  }

  function checkCode(){
    if(grant_type=='authorization_token'){
    }else if(grant_type=='refresh_token'){
    }else{
      return Promise.reject(3)
    }
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
