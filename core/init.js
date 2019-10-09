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

function init(){

  global.basedir=findBaseDir()

  const initDB=require(path.resolve(__dirname,'db','init.js'))
  const initLog=require(path.resolve(__dirname,'logger','init.js'))
  const initUtil=require(path.resolve(__dirname,'util','init.js'))
  const initOauth=require(path.resolve(__dirname,'oauth','init.js'))

  return initDB()
  .then(()=>{return initLog()})
  .then(()=>{return initUtil()})
  .then(()=>{return initOauth()})
  .catch((err)=>{
    console.log(err)
    process.exit(1)
  })
}
function findBaseDir(){
  const files=['server.js','package.json']
  const dirs=['core','node_modules','views']
  let curdir=__dirname
  var result=false
  try{
    while(!result){
      let flag=true
      files.forEach((file)=>{
        const filename=path.resolve(curdir,file)
        if(!(fs.existsSync(filename)&&fs.statSync(filename).isFile()))
          flag=false
      })
      dirs.forEach((dir)=>{
        const dirname=path.resolve(curdir,dir)
        if(!(fs.existsSync(dirname)&&fs.statSync(dirname).isDirectory()))
          flag=false
      })
      if(!flag)
        curdir=path.resolve(curdir,'..')
      else
        result=curdir
    }
    return result
  }catch(e){
    console.log(e)
    process.exit(1)
  }
}

module.exports=init
