const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const {hash,decode,encode}=require(path.resolve(global.basedir,'core','util','encrypt.js'))

module.exports=function(req,res,next){
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
        return select('TableApp',['secret AS s','redirect_uri AS u, permission AS p'],'rowid='+client_id)
        .then(rows=>{
          if(!rows.length) return Promise.reject(2)
          const row=rows[0]
          if(row.s!=s) return Promise.reject(2)
          return row
        })
      })
    }

    function checkGrantType(row)
    {
      if(grant_type=='authorization_token'){
        if(row.u!=redirect_uri) return Promise.reject(2)
      }else if(grant_type=='refresh_token'){
      }else{
        return Promise.reject(3)
      }
      return Promise.resolve(row)
    }
  }

  function checkCode(client){
    if(grant_type=='authorization_token'){
      return decode(code)
      .then(c=>{
        const uid=c.uid
        const iat=c.iat
        const cid=c.cid
        const scope=c.scope
        const type=c.type
        if(client_id!=cid) return Promise.reject(2)
        if(iat<new Date().getTime()/1000-3600) return Promise.reject(3)
        let s=0
        if(scope=='read') s=1
        else if(scope=='write') s=2
        if(s>client.p) return Promise.reject(4)
        if(type!='bearer') return Promise.reject(6)
        return c
      })
    }else if(grant_type=='refresh_token'){
      return decode(code)
      .then(c=>{
        const old=c.old
        const type=c.type
        const iat=c.iat
        const exp=c.exp
        if(type!='refresh_token') return Promise.reject(3)
        if(iat+exp<new Date().getTime()/1000) return Promise.reject(3)
        return old
      })
      .then(old=>{
        return decode(old)
        .then(t=>{
          const uid=t.uid
          const iat=t.iat
          const exp=t.exp
          const cid=t.cid
          const scope=t.scope
          if(cid!=client_id) return Promise.reject(3)
          let s=0
          if(scope=='read') s=1
          else if(scope=='write') s=2
          if(s>client.p) return Promise.reject(4)
          return t
        })
      })
    }else{
      return Promise.reject(3)
    }
  }

  function issueToken(info){
    let token={}

    token.uid=info.uid
    token.iat=new Date().getTime()/1000
    token.exp=3600*24
    token.cid=info.cid
    token.scope=info.scope

    token.iss='xiao\'s'
    token.aud='client'
    token.nbf=token.iat

    let refresh={}
    refresh.type='referesh_token'
    referesh_token.iat=token.iat
    referesh_token.exp=token.exp*7

    return encode(token)
    .then(t=>{
      refresh.old=t
      return encode(refresh)
      .then(r=>{
        res.body={
          access_token:t,
          token_type:'bearer',
          expires_in:token.exp,
          scope:token.scope,
          refresh_token:r
        }
      })
    })
  }

  function handleError(flag){
    res.status(400)
    switch(flag){
      case 1:
        res.body={
          error:'invalid request',
          error_description:'request could not be understood or processed'
        }
        break
      case 2:
        res.body={
          error:'invalid client',
          error_description:'the client firing the request could not be authenticated'
        }
        break
      case 3:
        res.body={
          error:'invalid grant',
          error_description:'the grant received is expired or not valid'
        }
        break
      case 4:
        res.body={
          error:'invalid scope',
          error_description:'the scope request was not understood or permitted'
        }
        break
      case 5:
        res.body={
          error:'unauthorised authorisation method',
          error_description:'the authorisation method requested is not available for this request'
        }
        break
      case 6:
        res.body={
          error:'unsupported grant type',
          error_description:`the grant type ${grant_type} requested was not supported for this request`
        }
        break
      default:
        res.status(500)
        res.body={
          error:'unknown error',
          error_description:'an unknown error occurred in the server'
        }
        break
    }
  }

  function reply()
  {
    if(!res.statusCode) res.status(500)
    if(res.body) res.send(JSON.stringify(res.body))
    else res.send()
    return Promise.resolve(res)
  }
}
