const path=require('path')
const fs=require('fs')
const config=require(path.resolve(__dirname,'config.js'))

function init(callback){
  return config()
  .then((p)=>{
    fs.stat(p.path,(err,stat)=>{
      if(err){
        if(err.code=='ENOENT')
          fs.mkdir(p.path)
        else
          return Promise.reject(err)
      }else{
        if(!stat.isDirectory())
          return Promise.reject(err)
      }
    })
  })
}
