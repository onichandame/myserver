const path=require('path')
const fs=require('fs')
const config=require(path.resolve(__dirname,'config.js'))

function access(){
  return fs.access(global.config.db.path, fs.constants.W_OK)
}

function init(){
  return config()
  .then((p)=>{
    fs.stat(p.path,(err,stat)=>{
      if(err){
        if(err.code=='ENOENT')
          fs.mkdir(p.path,(err)=>{
            err ? throw err : return access()
          })
        else
          throw err
      }else{
        stat.isDirectory() ? return access() : throw p.path+' is not a directory'
      }
    })
  })
}

module.exports=init
