const path=require('path')
const fs=require('fs')
const fsp=require('fs').promises

const filepath=path.resolve(global.basedir,'config.json')

function save(){
  return fsp.writeFile(filepath,JSON.stringify(global.config))
}

module.exports=save
