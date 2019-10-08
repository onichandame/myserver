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
            if(err)
              throw err
            return access()
          })
        else
          throw err
      }else{
        if(stat.isDirectory())
          return access()
        else
          throw p.path+' is not a directory'
      }
    })
  })
}

module.exports=init
