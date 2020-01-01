const path=rquire('path')

const salt=require(path.resolve(__dirname,'salt.js'))

/**
 * encode a secret by salting and hashing
 * @private
 * @memberof module:routers/auth
 * @method encodesecret
 * @param {text} secret - the secret being encoded
 * @returns {Object} returns {secret, salt, encoded}
*/
module.exports=function(secret){
  return salt()
  .then(async s=>{
    return {
      secret:secret,
      salt:s,
      encoded:await okitchen.encrypt.hash(secret+salt)
    }
  })
}
