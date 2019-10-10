/* user opens '/newuser'
 * server returns page with fields 'email' and 'username'
 * user fills the fields and xhr post to current url
 * server validates the info and return http status
 * server creates a random string and stores it in the password field then email the string to the registered email
 * browser receives the status code and displays the message
 *
 * When user clicks the link in the email
 * server receives the string as a query field
 * server validates the string and display password creation page
 * user fills the fields and xhr posts to current url
 * server validates the password and update the database then returns status
 * browser receives the status code and displays the message
 */

const path=require('path')
const insert=require(path.resolve(global.basedir,'core','db','insert.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))
const randomstring=require('randomstring')
const sender=require(path.resolve(global.basedir,'core','util','mail.js')).sendActivationCode
const {hash,encode}=require(path.resolve(global.basedir,'core','util','encrypt.js'))

module.exports=function(req,res,next){
  const code=req.query.code
  const uid=req.query.uid
  if(req.method=='GET'){
    if(code&&uid){
      return select('TableUser',['password'],'uid='+uid)
      .then(rows=>{
        if(!rows.length)
          return next({code:404})
        if(code!=rows[0].password)
          return next({code:422})
        res.status(200)
        res.page=path.resolve('oauth','newpass.pug')
        return next()
      })
    }else{
      return Promise.resolve(res.render(path.resolve('oauth','newuser.pug')))
    }
  }else if(req.method=='POST'){
    if(code&&uid){
      const password=req.body.pass
      var regex=/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
      return new Promise((resolve,reject)=>{
        if(!regex.test(password))
          return resolve(next({code:422}))
        return select('TableUser',['password','active'],'rowid='+uid)
        .then(rows=>{
          if(!rows.length)
            return next({code:404})
          if(!(!rows[0].active)&&rows[0].password==code)
            return next({code:422})
          return hash(password)
          .then(p=>{
            update('TableUser',{active:1,password:p},'rowid='+uid)
            .then(()=>{
              return select('TableUser',['password','active'],'rowid='+uid)
              .then(rows=>{
                if(!rows.length)
                  return logger.warn({message:'uid:'+uid+' failed to update password'})
                  .then(()=>{
                    return next()
                  })
                if(!(rows[0].active&&rows[0].password==p))
                  return logger.warn({message:'uid'+uid+' updated wrong password or active'})
                  .then(()=>{
                    return next()
                  })
                res.status(200)
                return next()
              })
            })
          })
        })
      })
    }else{

      const {username,email}=req.body
      return new Promise((resolve,reject)=>{
        if(!(username&&email))
          return resolve(next({code:422}))
        else return resolve()
      })
      .then(checkConflict)
      .then(saveUser)
      .then(finalize)

      // null: conflict
      // 1: inactive account exists
      // 2: no conflict
      function checkConflict(){
        return select('TableUser',['active','username','email'],'email='+email)
        .then(rows=>{
          if(rows.length&&rows[0].active)
            return next({code:303})
          else if(rows.length)
            return 1
          else
            return 2
        })
      }
      function saveUser(flag){
        if(flag==1)
          return update('TableUser',{username:username,password:randomstring.generate({length:20,charset:'alphabetic'}),active:0,created_at:new Date().toString(),permission:2})
          .then(()=>{
            return select('TableUser',['email','username','password','rowid'],'email=\''+email+'\'')
            .then(rows=>{
              if(!rows.length)
                return logger.error(new Error('Failed to update user info '+email))
              return rows[0]
            })
          })
        else if(flag==2)
          return insert('TableUser',{username:username,email:email,active:0,password:randomstring.generate({length:20,charset:'alphabetic'}),created_at:new Date().toString(),permission:2})
          .then(lastid=>{
            return select('TableUser',['password','username','email','rowid'],'rowid='+lastid)
            .then(rows=>{
              if(!rows.length)
                return logger.error(new Error('Failed to insert user info '+email))
              return rows[0]
            })
          })
        else
          return null
      }
      function finalize(row){
        if(!row)
          return null
        row.lk=req.protocol+'://'+req.hostname+':8080'+req.path+'?code='+row.password
        return sender(row)
        .then(()=>{
          res.status(200)
          return next()
        })
      }
    }
  }else{
    return next({code:405})
  }
}
