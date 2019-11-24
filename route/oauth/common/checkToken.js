/* Check if token expires and resolves scope on success rejects on failure
 * Reject: invalid token
 * Resolve(token): valid token
 * token: {cid,uid,scope}
 */
const path=require('path')
const {decode}=require(path.resolve(__dirname,'..','core.js')).encrypt
const {select}=require(path.resolve(__dirname,'..','core.js')).db

module.exports=function(req){
  return getToken()
  .then(validate)

  function getToken(){
    let auth=req.get('Authorization')
    auth=auth.split(" ")
    if(auth.length!=2) return Promise.reject()
    if(auth[0].toLowerCase()!='Bearer') return Promise.reject()
    return decode(auth[1])
  }

  function validate(token){
    const uid=token.uid
    const iat=token.iat
    const exp=token.exp
    const cid=token.cid
    const scope=token.scope

    return checkDate()
    .then(checkClient)
    .then(checkUser)
    .then(()=>{return {
      cid:cid,
      uid:uid,
      scope:scope
    }})

    function checkDate(){
      if(new Date().getTime()/1000 > iat+exp) return Promise.reject()
      else return Promise.resolve()
    }

    function checkClient(){
      if(!Number.isInteger(cid)) return Promise.reject()
      return select('TableApp',['permission'],'rowid='+cid)
      .then(rows=>{
        if(rows.length<1) return Promise.reject()
        const row=rows[0]
        let s=0
        switch(scope.toLowerCase()){
          case 'read':
            s=1
            break
          case 'write':
            s=2
            break
          default:
            break
        }
        if(row.permission<s) return Promise.reject()
      })
    }

    function checkUser(){
      if(!Number.isInteger(uid)) return Promise.reject()
      return select('TableUser',['active'],'rowid='+uid)
      .then(rows=>{
        if(rows.length<1) return Promise.reject()
        const row=rows[0]
        if(row.active<1) return Promise.reject()
      })
    }
  }
}
