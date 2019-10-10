/* Handle encryption
 *
 * 1. manage encrytion keys
 * 2. hash string
 * 3. encode JWT
 * 4. decode JWT
 */
var jwt=require('jsonwebtoken')
const path=require('path')
const {SHA3}=require('sha3')
const fs=require('fs')
const fsp=fs.promises
const randomstring=require('randomstring')
const logger=require(path.resolve(global.basedir,'core','logger','logger.js'))

function getKey(){
  return new Promise((resolve,reject)=>{
    const key=global.config.encrypt.key
    if(!key)
      global.config.encrypt.key=randomstring.generate({length:33,charset:'alphabetic'})
    return Promise.resolve(global.config.encrypt.key)
  })
  .catch(e=>{
    return logger.error(e)
  })
}

function encode(obj){
  return getKey()
  .then(key=>{
    return jwt.sign(obj,key,{algorithm:'HS256'})
  })
  .catch(e=>{
    return logger.error(e)
  })
}

function decode(token){
  getKey()
  .then(key=>{
    return jwt.verify(token,key,{algorithm:'HS256'})
  })
  .catch(e=>{
    return logger.error(e)
  })
}

function hash(raw){
  return new Promise((resolve,reject)=>{
    const hash=new SHA3(256)
    hash.update(raw)
    return resolve(hash.digest('hex'))
  })
  .catch(e=>{
    return logger.error(e)
  })
}

module.exports={
  encode:encode,
  decode:decode,
  hash:hash
}
