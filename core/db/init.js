/* check accessibility of the database file
 */
const path=require('path')
const fs=require('fs')
const fsp=fs.promises
const config=require(path.resolve(__dirname,'config.js'))

module.exports=function(){
  return config()
  .then(checkFile)

  function checkFile(c){
    return fsp.access(c.path,fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK)
    .then(()=>{
      return fsp.stat(c.path)
    })
    .then(stat=>{
      if(!stat.isFile()) return Promise.reject({code:'EISDIR'})
    })
    .catch(e=>{
      if(e.code=='ENOENT') return
      else return Promise.reject(e)
    })
    .then(()=>{
      return fsp.access(path.dirname(c.path),fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK)
    })
  }
}
