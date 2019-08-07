module.exports=function(req,res){
  const path=require('path')
  const conn=require(path.resolve(__dirname,"../db/db.connect.js"))
  const username=req.body.username
  const password=req.body.password

  const sqlite3=require('sqlite3').verbose()
  const db=new sqlite3.Database('db/user.sqlite3')
  db.serialize(function(){
    db.each('SELECT rowid')
  })
}
