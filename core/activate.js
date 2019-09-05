// POST with query string encoded in jwt: email, secret, creation_date
module.exports=function(req,res,next){
  const path=require('path')
  const db_param=require(path.resolve(__dirname,"db.js"))
  const sqlite3=require('sqlite3').verbose()
  const decode=require(path.resolve(__dirname,'util.js')).decodeJWT
  const code=req.query.code
  const id=req.query.id
  if(!(id===undefined)){
    if(req.method=='GET'){
      res.status(200)
      res.render('/init.pass.pug')
    }else if(req.method=='POST'){
      const password=req.body.pass
      var regex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
      if(!regex.test(password))
        next({code:422})
      let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
        if(err)
          next({code:500})
      })
      db.serialize(function(){
        const hash=require(path.resolve(__dirname,'util.js')).hashCode
        db.run('UPDATE '+db_param.tbl.user.name+' SET active=1,password=\''+hash(password)+'\' WHERE rowid='+id,(err)=>{
          if(err)
            next({code:500})
          res.status(200)
          res.send()
        })
      })
    }else{
      next({code:405})
    }
  }else if(!(code===undefined)){
    if(req.method!='GET')
      next({code:405})
    decode(req.body,(err,data)=>{
      if(err)
        next({code:500})
      const obj=JSON.parse(data)
      const creation_date=obj.creation_date
      const secret=obj.secret
      const email=obj.email
      let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
        if(err)
          next({code:500})
      })
      db.serialize(function(){
        db.each('SELECT rowid,password,creation_date FROM '+db_param.tbl.user.name+' WHERE email=\''+email+'\'',(err,row)=>{
          if(err)
            next({code:500})
          if(secret==row.password&&creation_date==row.creation_date){
            res.status(302)
            res.set('Location','/activate?id='+row.rowid)
            res.send()
          }else{
            next({code:422})
          }
        })
      })
    })
  }else{
    next({code:422})
  }
}
