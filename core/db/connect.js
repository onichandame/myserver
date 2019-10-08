const path=require('path')
const sqlite3=require('sqlite3').verbose()
const config=require(path.resolve(__dirname,'config.js'))

function connect(){
  return config()
  .then((p)=>{
    var db=new sqlite3.Database(path.resolve(p.path,p.name),sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      return db
    })
  })
}

module.exports=connect
