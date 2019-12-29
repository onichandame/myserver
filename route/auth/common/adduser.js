const path=require('path')
const okitchen=require('okitchen')

const salt=require(path.resolve(__dirname,'salt.js'))

/**
 * adds a user to the database
 * @private
 * @memberof module:routers/auth
 * @method adduser
 * @param {Object} u - the user info being inserted
 * @param {string} u.uname - the username
 * @param {string} u.email - the email
 * @param {string} u.password - the encoded password
 * @param {number} u.level - the authentication level
 * @returns {Promise} resolves with the rowid on success, terminates with error on failure
 */
module.exports=async function(u){
  if(!(u && 
    typeof u === 'object' && 
    typeof u.uname === 'string' &&
    typeof u.email === 'string' &&
    Number.isInteger(u.status) &&
    Number.isInteger(u.level)
  )) return Promise.reject(`adduser requires user info but receives ${JSON.stringify(u)}`)
  u.created_at=new Date().getTime()
  return okitchen.db.insert((await okitchen.config.get('auth.table')).name,u)
  .then(id=>{return salt(id)})
  .catch(e=>{return okitchen.logger.error(e)})
}
