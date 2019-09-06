module.exports=function(req,res,next){
  const path=require('path')
  const qry=req.query
  const fs=require('fs')
  const sqlite3=require('sqlite3').verbose()
  const {SHA3}=require('sha3')
  const randomString=require('randomstring')
  const db_param=require(path.resolve(__dirname,"db.js"))
  if(req.method=='GET'){
    res.render('newuser.pug')
  // post with given name, surname, name order, email
  }else if(req.method=='POST'){
    const family_name=req.body.family_name
    const given_name=req.body.given_name
    const email=req.body.email
    const name_order=req.body.name_order
    if(!(family_name&&given_name&&email&&(name_order==0||name_order==1)))
      next({code:400})
    let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err)
        next({code:500})
    })
    db.serialize(function(){
      db.each('SELECT rowid FROM '+db_param.tbl.user.name+' WHERE email=\''+email+'\'',(err,row)=>{
        if(err)
          next({code:500})
        next({code:303})
      })
      .run('INSERT INTO '+db_param.tbl.user.name+' (given_name,family_name,name_order,password,active,email,creation_date) VALUES ($given_name,$family_name,$name_order,$password,$active,$email,$creation_date)',{given_name:given_name,
      family_name:family_name,
      name_order:name_order,
      password:randomString.generate({length:20,
      charset:'alphabetic'}),
      active:0,
      email:email,
      creation_date:new Date().toString()},(err)=>{
        if(err)
          next(500)
        let sender=require(path.resolve(__dirname,'util.js')).sendActivationCode
        db.each('SELECT email,given_name,creation_date,password FROM '+db_param.tbl.user.name+' WHERE rowid='+self.lastID,(err,row)=>{
          sender({secret:row.password,
          email:row.email,
          given_name:row.given_name,
          creation_date:row.creation_date,
          req:req})
        })
        res.status(200)
        res.render('success.newuser.pug')
      })
    })
  }
}
