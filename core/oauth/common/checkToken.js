/* Check if token expires and resolves scope on success rejects on failure
 * Allow JSON string or object to be passed on as input
 * Reject 401: invalid token
 * Resolve: valid token
 */
const path=require('path')
const {decode}=require(path.resolve(global.basedir,'core','util','encrypt.js'))

module.exports=function(t){
  return normalizeToken()
  .then(check)

  function normalizeToken(){
    let token={}
    if(typeof t==='string')
      try{
        token=JSON.parse(t)
      }catch(e){
        return Promise.reject(401)
      }
    else if(t&&typeof t==='object'&&!(t instanceof Array))
      token=t
    else
      return Promise.reject(401)
    return token
  }

  function check(token){
    return decode(token.access_token)
    .then(obj=>{
      const {iss,nbf,iat,exp}=obj
      if(!(obj&&iss&&nbf&&nbf<new Date().getTime()/1000&&iat&&exp&&iat+exp<new Date().getTime()/1000))
        return Promise.reject(401)
      return obj.info
    })
    .catch(e=>{return Promise.reject(401)})
  }
}
