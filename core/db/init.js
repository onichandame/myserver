const path=require('path')
const fs=require('fs')
const fsp=fs.promises
const config=require(path.resolve(__dirname,'config.js'))

function access(){
  return fsp.access(global.config.db.path, fs.constants.W_OK)
}

function init(){
  return config()
  .then(p=>{
    return fsp.stat(p.path)
    .then(stat=>{
      if(stat.isDirectory())
        return access()
      else
        throw p.path+' is not a directory'
    })
    .catch(e=>{
      if(e.code=='ENOENT')
        return fsp.mkdir(p.path)
      else
        throw e
    })
  })
}

module.exports=init
