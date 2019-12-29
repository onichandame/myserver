const path=require('path')
const okitchen=require('okitchen')
const randomstring=require('randomstring')

/**
 * check if a session id is valid
 * @memberof module:routers/auth
 * @method checksession
 * @param {string} key - the key of the session being checked
 * @returns {Promise<int>} resolves with the user id on success, nothing on failure
 */
module.exports=function(key){
  if(typeof key !== 'string') return Promise.reject(`checksession requires a string but receives ${typeof key}`)
  return okitchen.db.delete((await okitchen.config.get('session.table')).name,`(created_at+expires_in)<${new Date().getTime()}`)
  .then(()=>{return okitchen.db.selectOne((await okitchen.config.get('session.table')).name,['user','created_at','expires_in'],`key='${key}'`)})
  .then(row=>{
    if(!row) return
    if(row.expires_in+row.created_at>new Date().getTime()) return row.user
  })
}
