/* user opens '/newuser'
 * server returns page with fields 'email' 'given_name' family_name' and 'name_order'
 * user fills the fields and xhr post to current url
 * server validates the info and return http status
 * server encodes the email, creation_date and secret to jwt and sends the code to email asyncally
 * browser receives the status code and displays the message
 */
module.exports=function(req,res,next){
  const path=require('path')
  const decode=require(path.resolve(__dirname,'util.js')).decodeJWT
  const sqlite3=require('sqlite3').verbose()
  const {SHA3}=require('sha3')
  const randomString=require('randomstring')
  const db_param=require(path.resolve(__dirname,"db.js"))
  if(req.method=='GET'){
    if(req.query.code){
      decode(req.query.code,function(err,data){
        if(err)
          return next({code:500,message:err.message})
        const creation_date=data.creation_date
        const secret=data.secret
        const email=data.email
        const uid=data.uid
        let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
          if(err)
            return next({code:500,message:err.message})
        })
        db.serialize(function(){
          db.each('SELECT email,password,creation_date FROM '+db_param.tbl.user.name+' WHERE rowid='+uid,(err,row)=>{
            if(err)
              return next({code:500,message:err.message})
            if(secret==row.password&&creation_date==row.creation_date&&email==row.email){
              res.status(200)
              res.render('init.pass.pug')
            }else{
              return next({code:422})
            }
          })
        })
      })
    }else{
      res.render('newuser.pug')
    }
  // post with given name, surname, name order, email
  }else if(req.method=='POST'){
    if(req.query.code){
      const password=req.body.pass
      var regex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
      if(!regex.test(password)){
        console.log('password invalid')
        return next({code:422})
      }
      decode(req.query.code,function(err,data){
        if(err){
          console.log('error passed on from decode')
          console.log(JSON.stringify(err))
          return next({code:500,message:err.message})
        }
        const creation_date=data.creation_date
        const secret=data.secret
        const email=data.email
        const uid=data.uid
        let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
          if(err)
            return next({code:500,message:err.message})
        })
        db.serialize(function(){
          const hash=require(path.resolve(__dirname,'util.js')).hashCode
          db.each('SELECT active,email,creation_date,password FROM '+db_param.tbl.user.name+' WHERE rowid='+uid,(err,row)=>{
            if(err)
              return next({code:500,message:err.message})
            if(!(secret==row.password&&creation_date==row.creation_date&&email==row.email)){
              console.log('wrong credentials: '+JSON.stringfiy(row)+JSON.stringify(data))
              return next({code:422,message:'Wrong code: '+req.query.code})
            }
            if(row.active>0){
              console.log('already activated')
              return next({code:409,message:'re-activation request for uid='+uid})
            }
            db.run('UPDATE '+db_param.tbl.user.name+' SET active=1,password=\''+hash(password)+'\' WHERE rowid='+uid,(err)=>{
              if(err){
                console.log('update failed'+JSON.stringify(err))
                return next({code:500,message:err.message})
              }
              res.status(200)
              res.send()
            })
            .close()
          })
        })
      })
    }else{
      const family_name=req.body.family_name
      const given_name=req.body.given_name
      const email=req.body.email
      const name_order=req.body.name_order
      if(!(family_name&&given_name&&email&&(name_order==0||name_order==1)))
        return next({code:400})
      let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)=>{
        if(err)
          return next({code:500,message:err.message})
      })
      db.serialize(function(){
        db.each('SELECT rowid FROM '+db_param.tbl.user.name+' WHERE email=\''+email+'\'',(err,row)=>{
          if(err)
            return next({code:500,message:err.message})
          return next({code:303})
        })
        .run('INSERT INTO '+db_param.tbl.user.name+' (given_name,family_name,name_order,password,active,email,creation_date) VALUES ($given_name,$family_name,$name_order,$password,$active,$email,$creation_date)',{$given_name:given_name,
        $family_name:family_name,
        $name_order:name_order,
        $password:randomString.generate({length:20,
        charset:'alphabetic'}),
        $active:0,
        $email:email,
        $creation_date:new Date().toString()},function(err){
          if(err)
            return next({code:500,message:err.message})
          let sender=require(path.resolve(__dirname,'util.js')).sendActivationCode
          db.each('SELECT rowid,email,given_name,creation_date,password FROM '+db_param.tbl.user.name+' WHERE rowid='+this.lastID,(err,row)=>{
            if(err)
              return next({code:500,message:err.message})
            sender({secret:row.password,
            uid:row.rowid,
            email:row.email,
            baseurl:req.protocol+'://'+req.hostname+':8080'+req.path,
            given_name:row.given_name,
            creation_date:row.creation_date})
          })
          res.status(200)
          if(req.xhr)
            res.send()
          else
            res.render('success.newuser.pug')
        })
      })
    }
  }
}
