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
const {exit,getConfig}=require(path.resolve(__dirname,'base.js'))
const {initDB}=require(path.resolve(__dirname,'db.js'))
const {initLog}=require(path.resolve(__dirname,'logger.js'))
const {initEncrypt}=require(path.resolve(__dirname,'encrypt.js'))

async function init(callback){
  initGlobalDir()
  initDB(()=>{
    initLog(()=>{
      initEncrypt(()=>{
        callback()
      })
    })
  })
}
function initGlobalDir(){
  const basedir=findBaseDir()
  if(basedir)
    global.basedir=basedir
  else
    exit('Failed to find basedir')
  const config=path.resolve(global.basedir,'config.json')
  if(checkConfig(config))
    global.config=config
}
function checkConfig(config){
  try{
    fs.accessSync(config,fs.constants.R_OK)
    return true
  }catch(e){
    return false
  }
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
        const dirname=path.resole(curdir.dir)
        if(!(fs.existsSync(dirname)&&fs.statSync(dirname).isDirectory()))
          flag=false
      })
      if(!flag)
        curdir=path.resolve(curdir,'..')
      else
        result=curdir
    }
  }catch(e){
    result=false
  }
  return result
}

module.exports=init
