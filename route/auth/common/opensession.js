const path=require('path')
const okitchen=require('okitchen')
const randomstring=require('randomstring')

/**
 * @memberof module:routers/auth
 * @method opensession
 * @param {number} id - the rowid of the user of the session
 * @returns {Promise<string>} resolves with the session key on success
 */
module.exports=async function(id){
  if(!Number.isInteger(id)) return Promise.reject(`openssion requires an integer but receives ${typeof id}`)
  return okitchen.db.insert((await okitchen.config.get('session.table')).name,{user:id,key:randomstring.generate({length:20,charset:'alphanumeric'}),created_at:new Date().getTime(),expires_in:24*60*60*1000})
  .then(async lastid=>{
    return okitchen.db.selectOne((await okitchen.config.get('session.table')).name,['key'],`rowid=${lastid}`)
    .then(row=>{return row.key})
  })
}
