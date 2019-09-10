const path=require('path')
const db_param=require(path.resolve(__dirname,"db.js"))
const randomString=require('randomstring')
const sqlite3=require('sqlite3').verbose()
const validate=require(path.resolve(__dirname,'util.js')).validateSid
module.exports=function(req,res,next){
  if(req.method=='GET'){
    const sid=req.cookies('sid')
    if(!sid)
      next({code:401})
    let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err){
        return next({code:500})
      }
    })
    const valid=validate(sid)
    if(typeof(valid)=='object')
      return next({code:500,err:err})
    if(!valid)
      return next({code:401})
    db.serialize(function(){
      db.get('SELECT COUNT(rowid) as num FROM '+db_param.tbl.app.name,(err,row)=>{
        if row.num<1{
          res.status(200)
          res.render('newapp.pug')
        }else{
          next({code:405})
        }
      })
    })
    res.status(200)
    res.render('newapp.pug')
  }else if(req.method=='POST'){
    const name=req.body.name
    const callback=req.body.callback
    const type=req.body.type
    const sid=req.cookies('sid')
    if(!sid)
      return next({code:401})
    let valid=true
    if(name.length<3)
      valid=false
    if(!/[^\s]/.test(callback))
      valid=false
    if(!(type==0||type==1))
      valid=false
    if(!valid)
      return next({code:422})
    if(!req.query.first)
      return next({code:405})
    let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err){
        return next({code:500})
      }
    })
    db.serialize(function(){
      uid=validate(sid)
      if(typeof(uid)=='object')
        return next({code:500,err:err})
      if(!uid)
        return next({code:401})
      db.each('SELECT rowid in '+db_param.tbl.app.name+' WHERE name=\''+name+'\' OR callback=\''+callback+'\'',(err,row)=>{
        if(err)
          return next({code:500})
        return next({code:303})
      })
      .run('INSERT INTO '+db_param.tbl.app.name+' (name,type,callback,secret,creator,priviledge) VALUES ($name,$type,$callback,$secret,$creator,$priviledge)',{$name:name,$callback:callback,$type:type,$secret:randomString.generate({length:30,charset:'alphabetic'}),$creator:uid,$priviledge:0},(err)=>{
        if(err)
          return next({code:500})
        db.each('SELECT secret FROM '+db_param.tbl.app.name+' WHERE rowid='+this.lastID,(err,row)=>{
          if(err)
            return next({code:500})
          const sender=require(path.resolve(__dirname,'util.js')).sendApp
          sender({name:name,type:type ? 'Native' : 'Web',callback:callback,secret:row.secret})
          res.status(200)
          res.send()
        })
      })
    })
  }else{
    return next({code:405})
  }
}
