const path=require('path')
const db_param=require(path.resolve(__dirname,"db.js"))
const sqlite3=require('sqlite3').verbose()
const hash=require(path.resolve(__dirname,'util.js')).hashCode
module.exports=function(req,res,next){
  if(req.method=='GET'){
    res.status(200)
    res.render('authenticate.pug')
  }else if(req.method=='POST'){
    const email=req.body.email
    const pass=req.body.pass
    let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err){
        return next({code:500})
      }
    })
    valid=false
    first=false
    db.serialize(function(){
      db.get('SELECT COUNT(rowid) as num FROM '+db_param.tbl.user.name+' WHERE active=1',(err,row)=>{
        if(err)
          return next({code:500})
        if(row.num==1)
          first=true
        else 
          first=false
      })
      .each('SELECT password FROM '+db_param.tbl.user.name+' WHERE email=\''+email+'\'',(err,row)=>{
        if(err)
          return next({code:500})
        if(hash(pass)==row.password)
          valid=true
        else
          valid=false
        if(!valid)
          return next({code:401})
        if()
        if(first){
          res.status(302)
          res.set('Location','/newapp?first=true')
          res.send()
        }else{
          // Add oauth redirect here
        }
      })
    })
  }else{
    next({code:405})
  }
}
