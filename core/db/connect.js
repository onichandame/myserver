const path=require('path')
const sqlite=require('sqlite')
const config=require(path.resolve(__dirname,'config.js'))

function connect(){
  return config()
  .then(async (p)=>{
    const dbp=sqlite.open(path.resolve(p.path,p.name),{Promise})
    return await dbp
  })
}

module.exports=connect
