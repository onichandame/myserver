const path=require('path')
const sqlite=require('sqlite')
const config=require(path.resolve(__dirname,'config.js'))

module.exports=function(){
  return config()
  .then(p=>{
    return sqlite.open(path.resolve(p.path,p.name),{Promise})
  })
}
