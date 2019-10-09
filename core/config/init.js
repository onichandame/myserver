const path=require('path')
const fs=require('fs')
const fsp=fs.promises

const filepath=path.resolve(global.basedir,'config.json')

function exists(){
  return fsp.stat(filepath)
  .then(stat=>{
    return stat.isFile() ? true : false
  })
  .catch(err=>{
    if(err.code=='ENOENT')
      return fsp.writeFile(filepath,'')
    else
      throw err
  })
}

function accessible(){
  return exists()
  .then(f=>{
    if(!f)
      throw filepath+' not accessible'
    return fsp.access(filepath,fs.constants.R_OK | fs.constants.W_OK)
  })
}

function init(){
  return accessible()
  .then(()=>{
    return fsp.readFile(filepath,'utf8')
    .then(data=>{
      const param=JSON.parse(data)
      global.config=param
      return global.config
    })
  })
}
module.exports=init
