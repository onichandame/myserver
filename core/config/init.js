const path=require('path')
const fs=require('fs')

const filepath=path.resolve(global.basedir,'config')

function exists(){
  return new Promise((resolve,reject)=>{
    fs.stat(filepath,(err,stat)=>{
      if(err){
        if(err.code=='ENOENT')
          fs.writeFile(filepath,'',(err)=>{
            return err ? reject(err) : resolve()
          })
        else
          return reject(err)
      }else{
        return stat.isFile() ? resolve() : reject({message:filepath+' must be a file!'})
      }
    })
  })
}

function accessible(){
  return exists()
  .then(()=>{
    fs.access(filepath,fs.constants.R_OK | fs.constants.W_OK)
  })
}

function init(){
  return accessible()
  .then(()=>{
    fs.readFile(filepath,(err,data)=>{
      const param=JSON.parse(data)
      global.config=param
    })
  })
}
module.exports=init
