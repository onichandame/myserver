const okitchen=require('okitchen')

/**
 * validates secret
 * @memberof module:routers/auth
 * @method checksecret
 * @param {string} secret - plain text secret
 * @param {string} salt - salt of the secret
 * @param {string} ans - the encoded secret
 * @returns {Promise} resolves with nothing on success, rejects with nothing on failure, rejects with error if unexpected error occurred
 */
module.exports=async function(secret,salt,ans){
  if(!(typeof secret === 'string' && secret && typeof salt === 'string' && salt && typeof ans === 'string' && ans)) return Promise.reject(`{${secret},${salt},${ans}} are not valid params`)
  if(await okitchen.encrypt.hash(secret+salt) == ans) return Promise.resolve()
  else return Promise.reject()
}
