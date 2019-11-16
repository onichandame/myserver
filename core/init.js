/* initiation
 *
 * Check error file
 *   if not accessible, print error and terminate
 * Check database configuration file
 *   if not present, try create default
 *     if creation failed, throw error
 * Check db tables
 *   if not present, try create empty ones
 *   if present with wrong columns, throw error
 */
const path=require('path')
const fs=require('fs')

module.exports=function(){

  const initDB=require(path.resolve(__dirname,'db','init.js'))
  const initLog=require(path.resolve(__dirname,'logger','init.js'))
  const initUtil=require(path.resolve(__dirname,'util','init.js'))

  return initDB()
  .then(initLog)
  .then(initUtil)
  .catch((e)=>{
    console.log(e)
    process.exit(1)
  })
}
