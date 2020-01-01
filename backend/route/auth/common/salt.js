const randomstring=require('randomstring')

/**
 * generate new salt
 * @private
 * @memberof module:routers/auth
 * @method salt
 * @returns {Promise<text>} resolves with new salt generated
 */
module.exports=async function(){
  return Promise.resolve(randomstring.generate({length:8,charset:'alphanumeric'}))
}
