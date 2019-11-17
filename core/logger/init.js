/* create table if not exist
 */
const path=require('path')
const fs=require('fs')
const fsp=require('fs').promises

const config=require(path.resolve(__dirname,'config.js'))
const addtable=require(path.resolve('..','db','addtable.js'))

module.exports=function(){
  return config()
  .then(c=>{
    return addtable(c)
  })
  .then(checkErrorFile)

  function checkErrorFile(){
    return config()
    .then(c=>{
      return fsp.access(c.errfile,fs.constants.F_OK | fs.constants.W_OK)
      .then(()=>{return fsp.stat(c.errfile)})
      .then(stat=>{
        if(!stat.isFile()) return Promise.reject({code:'EISDIR'})
      })
      .catch(e=>{
        if(e.code=='ENOENT') return
        else return Promise.reject(e)
      })
      .then(()=>{
        return fsp.access(path.dirname(c.errfile),fs.constants.F_OK | fs.constants.W_OK)
      })
    })
  }
}
