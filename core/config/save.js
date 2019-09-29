const path=require('path')
const config=require(path.resolve(__dirname,'config.js'))
const fs=require('fs')

async function save(){
  return new Promise(resolve,reject)=>{
    if(!config)
      return reject({message:'config not initialized'})
    if(!global.config)
      return reject({message:'config file path not initialized'})
    fs.writeFile(global.config,JSON.stringify(config),(err)=>{
      return err ? reject(err) : resolve()
    })
  }
}

module.exports=save
