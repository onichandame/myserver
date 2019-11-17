/* core module provides the basic config, database, logger, encryption and mail utilities
 * before using any of the functions this module needs to be called\
 */
const path=require('path')
const fs=require('fs')

module.exports=function(){

  const initDB=require(path.resolve(__dirname,'db','init.js'))
  const initLog=require(path.resolve(__dirname,'logger','init.js'))
  const initUtil=require(path.resolve(__dirname,'util','init.js'))
  const initEnc=require(path.resolve(__dirname,'encrypt','init.js'))

  return initDB()
  .then(initLog)
  .then(initUtil)
  .then(initEnc)
  .catch((e)=>{
    console.log(e)
    process.exit(1)
  })
}
