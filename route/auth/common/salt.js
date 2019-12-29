const randomstring=require('randomstring')
const okitchen=require('okitchen')

/**
 * Add salt to a password and store the salted password and the salt to the database. The salt is an 8-character long random string appended to the end of the password
 * @private
 * @memberof module:routers/auth
 * @method salt
 * @id {number} id - the rowid of the user being salted
 * @returns {Promise} resolves with nothing on success, terminates with error on failure
 */
module.exports=async function(id){
  if(!Number.isInteger(id)) return Promise.reject(`salt function requires int but receives ${typeof id}`)
  salt=randomstring.generate({length:8,charset:'alphanumeric'})
  return okitchen.db.selectOne((await okitchen.config.get('auth.table')).name,['password'],`rowid=${id}`)
  .then(row=>{
    if(!row) return Promise.reject(`user with rowid ${id} not found!`)
    return okitchen.encrypt.hash(`${row.password}${salt}`)
    .then(async encoded=>{
      return okitchen.db.update((await okitchen.config.get('auth.table')).name,{password:encoded,salt:salt},`rowid=${id}`)
    })
    .catch(e=>{return okitchen.logger.error(e)})
  })
}
