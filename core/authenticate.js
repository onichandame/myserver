const path=require('path')
const db_param=require(path.resolve(__dirname,"db.js"))
const sqlite3=require('sqlite3').verbose()
const hash=require(path.resolve(__dirname,'util.js')).hashCode
module.exports=function(req,res,next){
  let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
    if(err){
      return next({code:500})
    }
  })
  if(req.method=='GET'){
    res.status(200)
    res.render('authenticate.pug')
  }else if(req.method=='POST'){
    const email=req.body.email
    const pass=req.body.pass
    var valid=false
    //Auth code flow
    if(req.query.response_type=='code'){
      //Implicit flow
    }else if(req.query.response_type=='token'){
      //No oauth flow
    }else{
      var first=false
      db.serialize(function(){
        db.get('SELECT COUNT(rowid) as num FROM '+db_param.tbl.user.name+' WHERE active=1',(err,row)=>{
          if(err)
            return next({code:500})
          if(row.num==1)
            first=true
          else 
            first=false
        })
        .each('SELECT password,rowid FROM '+db_param.tbl.user.name+' WHERE email=\''+email+'\'',(err,row)=>{
          if(err)
            return next({code:500})
          if(hash(pass)==row.password)
            valid=true
          else
            valid=false
          if(valid){
            db.serialize(function(){
              db.run('INSERT INTO '+db_param.tbl.session.name+' (creation_date,expired_in,uid) VALUES ($creation_date,$expired_in,$uid)',{$creation_date:new Date().toString(),$expired_in:3600,$uid:row.rowid},(err)=>{
                if(err)
                  return next({code:500})
                res.cookie('sid',this.lastID)
                if(first){
                  res.status(302)
                  res.send()
                }else{
                  res.status(200)
                  res.send()
                }
              })
            })
          }else{
            return next({code:401})
          }
        })
      })
    }
  }else{
    next({code:405})
  }
}
