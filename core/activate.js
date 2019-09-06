// POST with query string encoded in jwt: email, secret, creation_date
module.exports=function(req,res,next){
  const path=require('path')
  const randomString=require('randomstring')
  const db_param=require(path.resolve(__dirname,"db.js"))
  const sqlite3=require('sqlite3').verbose()
  const decode=require(path.resolve(__dirname,'util.js')).decodeJWT
  const code=req.query.code
  const id=req.query.id
  if(!(id===undefined)){
    if(req.method=='GET'){
      res.status(200)
      res.render('init.pass.pug')
    }else if(req.method=='POST'){
      const password=req.body.pass
      console.log(password)
      var regex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
      if(!regex.test(password))
        return next({code:422})
      let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
        if(err)
          return next({code:500})
      })
      db.serialize(function(){
        const hash=require(path.resolve(__dirname,'util.js')).hashCode
        db.run('UPDATE '+db_param.tbl.user.name+' SET active=1,password=\''+hash(password)+'\' WHERE rowid='+id,(err)=>{
          if(err)
            return next({code:500})
          if(id==1){
            db.run('INSERT INTO '+db_param.tbl.appadmin.name+' (rowid,level) VALUES ('+id+',0)',(err)=>{
              if(err)
                return next({code:500})
              res.status(200)
              res.render('init.admin.pug')
            })
          }else{
            res.status(200)
            res.send()
          }
        })
      })
    }else{
      return next({code:405})
    }
  }else if(!(code===undefined)){
    if(req.method!='GET')
      return next({code:405})
    decode(code,(err,data)=>{
      if(err)
        return next({code:500})
      const creation_date=data.creation_date
      const secret=data.secret
      const email=data.email
      let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
        if(err)
          return next({code:500})
      })
      db.serialize(function(){
        db.each('SELECT rowid,password,creation_date FROM '+db_param.tbl.user.name+' WHERE email=\''+email+'\'',(err,row)=>{
          if(err)
            return next({code:500})
          if(secret==row.password&&creation_date==row.creation_date){
            res.status(302)
            console.log('/activate?id='+row.rowid)
            res.set('Location','/activate?id='+row.rowid)
            res.send()
          }else{
            return next({code:422})
          }
        })
      })
    })
    // Handle first app's registration
  }else if(!(req.query.admin===undefined)){
    const name=req.body.name
    const callback=req.body.admin
    const type=req.body.type
    if(!(name&&callback&&(type==0||type==1)))
      return next({code:400})
    let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
      if(err)
        return next({code:500})
    })
    db.serialize(function(){
      db.each('SELECT rowid FROM '+db_param.tbl.app.name,(err,row)=>{
        if(err)
          return next({code:500})
        return next({code:303})
      })
      .each('SELECT rowid FROM '+db_param.tbl.appadmin.name+' WHERE level=0',(err,row)=>{
        if(err)
          return next({code:500})
        db.run('INSERT INTO '+db_param.tbl.app.name+' (name,type,callback,secret,creator,priviledge) VALUES (\''+name+'\','+type+'\',\''+callback+'\',\''+randomString.generate({length:20,charset:'alphabetic'}+'\','+row.rowid+',0)',(err)=>{
          if(err)
            return next({code:500})
          var lid=this.lastID
          db.each('SELECT type,name,secret FROM '+db_param.tbl.app.name+' WHERE rowid='+lid,(err,rowa)=>{
            if(err)
              return next({code:500})
            db.each('SELECT given_name,email FROM '+db_param.tbl.user.name+' WHERE rowid='+row.rowid,(err,rowu)=>{
              if(err)
                return next({code:500})
              const sender=require(path.resolve(__dirname,'util.js')).sendApp
              sender({email:rowu.email,name:rowa.name,given_name:rowu.given_name,secret:rowa.secret,type:rowa.type},(err)=>{
                if(err)
                  console.log('failed to send app info')
              })
              res.status(200)
              res.send()
            })
          })
        }))
      })
      .close()
    })
  }else{
    return next({code:422})
  }
}
