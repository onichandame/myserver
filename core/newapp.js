const path=require('path')
const db_param=require(path.resolve(__dirname,"db.js"))
const sqlite3=require('sqlite3').verbose()
module.exports=function(req,res,next){
  if(req.method=='GET'){
    let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err){
        return next({code:500})
      }
    })
    res.status(200)
    res.render('newapp.pug')
  }else if(req.method=='POST'){
  }else{
    return next({code:405})
  }
}
