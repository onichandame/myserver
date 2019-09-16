/* user opens '/newuser'
 * server returns page with fields 'email' 'given_name' family_name' and 'name_order'
 * user fills the fields and xhr post to current url
 * server validates the info and return http status
 * server encodes the email, creation_date and secret to jwt and sends the code to email asyncally
 * browser receives the status code and displays the message
 */
const path=require('path')
const {select,insert,update}=require(path.resolve(__dirname,'..','db.js'))
const subpath=path.resolve('core','oauth')
const randomstring=require('randomstring')
const sender=require(path.resolve(__dirname,'..','util','mail.js')).sendActivationCode
const {generateJWT}=require(path.resolve(__dirname,'..','util','encrypt'))
module.exports=function(req,res,next){
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
      //display user registration form
      res.render(path.resolve(subpath,'newuser.pug'))
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
      const {username,email}=req.body
      if(!(username&&email))
        return next({code:400})
      select('user',['active'],'email=\''+email,(row)=>{
        if(active>0){
          res.set('Location','')
          return next({code:303})
        }
      },(num)=>{
        if(num>0){
          update('user',{username:username,password:randomstring:randomstring.generate({length:20,charset:'alphabetic'})},(id)=>{
            finalize(id)
          })
        }else{
          insert('user',{email:email,username:username,active:0,password:randomstring.generate({length:20,charset:'alphabetic'})},(id)=>{
            finalize(id)
          })
        }
        function finalize(){
          select('user',['rowid','email','username','password'],'rowid='+id,(row)=>{
            var url=req.protocol+'://'+req.hostname+':8080'+req.path+'?code='+generateJWT({secret:row.password,uid:row.rowid,username:row.username})
            sender(row.username,url,row.email)
            res.status(200)
            res.locals.page='core/oauth/success.newuser.pug'
            return next()
          })
        }
      })
    }
  }
}
