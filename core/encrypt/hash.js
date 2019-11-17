const {SHA3}=require('sha3')

const logger=require(path.resolve(global.basedir,'core','logger','logger.js'))

function hash(raw){
  return new Promise((resolve,reject)=>{
    const hash=new SHA3(256)
    hash.update(raw)
    return resolve(hash.digest('hex'))
  })
  .catch(logger.error)
}
