const okitchen=require('okitchen')

/**
 * checks if a user is valid. email is preferred. if not present, uname must be passed
 * @private
 * @memberof module:routers/auth
 * @method checkuser
 * @param {Object} u - the user information
 * @param {string} u.uname - the username
 * @param {string} u.email - the email
 * @param {string} u.password - the password in plaintext 
 * @returns {Promise} resolves with the entire row on success, nothing if user not found, rejects with error on failure
 */
module.exports=async function(u){
  if(!(typeof u === 'object' &&
    (typeof u.uname === 'string' || typeof u.email === 'string') &&
    typeof u.password === 'string'
  )) return Promise.reject(`checkuser requires user info but receives ${JSON.stringify(u)}`)
  return okitchen.db.selectOne((await okitchen.config.get('auth.table')).name,['password','salt'],`${u.email ? `email='${u.email}'` : `uname='${u.uname}'`}`)
  .then(async row=>{
    if(!row) return
    if((await okitchen.encrypt.hash(`${u.password}${row.salt}`)) == row.password) return row
    return Promise.reject(`${JSON.stringify(u)} fails credential check`)
  })
}
