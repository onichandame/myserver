const path=require('path')
const okitchen=require('okitchen')
const randomstring=require('randomstring')

const encodesecret=require(path.resolve(__dirname,'encodesecret.js'))

/**
 * @memberof module:routers/auth
 * @method opensession
 * @param {number} id - the rowid of the user of the session
 * @returns {Promise<string>} resolves with the session key on success
 */
module.exports=async function(id){
  if(!Number.isInteger(id)) return Promise.reject(`openssion requires an integer but receives ${typeof id}`)
  let secret=await encodesecret(randomstring.generate({length:20,charset:'alphanumeruc'}))
  let flag=true
  while(flag){
    if(await okitchen.db.selectOne((await okitchen.config.get('session.table')).name,[1],`key='${secret.encoded}'`)) secret=await encodesecret(randomstring.generate({length:20,charset:'alphanumeruc'}))
    else flag=false
  }
  okitchen.db.delete((await okitchen.config.get('session.table')).name,`(created_at+expires_in)<${new Date().getTime()}`)
  return okitchen.db.insert((await okitchen.config.get('session.table')).name,{user:id,key:secret.encoded,salt=secret.salt,created_at:new Date().getTime(),expires_in:24*60*60*1000})
  .then(()=>{
    return secret.secret
  })
}
