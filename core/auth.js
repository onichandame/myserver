module.exports=function(req,res,next){
  const path=require('path')
  const pt=req.path
  const qry=req.query
  const sqlite3=require('sqlite3').verbose()
  const {SHA3}=require('sha3')
  const db_param=require(path.resolve(__dirname,"db.js")).auth
  if(req.method=='GET'){
    if(pt.includes('authorise')){
      if(qry.response_type=='code'){
      }else if(qry.response_type=='token'){
        const cid=qry.client_id
        const uri=qry.redirect_uri
        const scope=qry.scope
        let db=new sqlite3.Database(db_param.app.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)={
          if (err){
            res.status(500)
            res.send()
          }
        })
        db.serialize(function(){
          var sql='CREATE TABLE IF NOT EXISTS '
          sql += db_param.app.tblname 
          sql += ' ('
          for(const [key,value] of Object.entries(db_param.app.col)){
            sql += key 
            sql += ' '
            sql += value 
            sql +=','
          }
          sql=sql.slice(0,-1)
          sql += ')'
          db.run(sql,(err)=>{
            if(err)
              next(err)
          })
            .each('SELECT secret,redirect_uri as uri from '+db_param.app.tblname+' where rowid='+cid,(err,row)=>{
                console.log("1")
              if(err){
                res.status(500)
                res.send()
              }else{
                res.render('core/auth/authorise.auth.pug')
              }
            })
        })
      }else{
        res.status(401)
        res.send()
      }
    }else if(pt.includes('newuser')){
      res.render('core/auth/newuser.auth.pug')
    }else if(pt.includes('newapp')){
      res.render('core/auth/newapp.auth.pug')
    }else{
      decodeToken(req.cookies.token,(err,token)=>{
        if(err)
          res.send()
        else
          res.json(token)
      })
    }
  }else if(req.method=='POST'){
    if(pt.includes('authorise')){
      const username=req.body.username
      // implicit issurance
      if(qry.response_type=='token'){
        if(username){
          var token={access_token:{username:username}}
          token.expires_in=3600
          token.token_type="bearer"
          token.scope=qry.scope
          token.created_at=new Date().toString()

          let db=new sqlite3.Database(db_param.user.dbname,sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,(err)=>{
            if (err)
              next(err)
          })
          db.serialize(function(){
            db.all('SELECT rowid,email,active FROM '+db_param.user.tblname+' WHERE username=\''+username+'\'',(err,rows)=>{
              if(err||rows.length!=1){
                res.status(400)
                res.send()
              }
              const row=rows[0]
              token.uid=row.uid
              token.access_token.email=row.email
              generateToken(token,(err,result)=>{
                if(err){
                  res.status(500)
                  res.send()
                }else{
                  res.status(200)
                  let adb= new sqlite3.Database(db_param.app.dbname,sqlite3.OPEN_READWRITE |sqlite3.OPEN_CREATE,(err)=>{
                    if(err)
                      next(err)
                  })
                  adb.serialize(function(){
                    adb.all('SELECT redirect_uri FROM '+db_param.app.tblname+' WHERE rowid='+qry.client_id,(err,rows)=>{
                      if(err||rows.length!=1){
                        res.status(400)
                        res.send()
                      }else{
                        row=rows[0]
                        res.redirect(row.redirect_uri+'/'+qry.redirect_uri+'#'+result)
                      }
                    })
                    .close()
                  })
                }
              })
            })
            .close()
          })
        }else{
          res.status(400)
          res.send()
        }
      }
    }else if(pt.includes('request')){
      if(req.body.token){
        res.status(200)
        decodeToken(token.access_token,(err,result)=>{
          if(err){
            res.status(400)
            res.send()
          }else{
            res.json(result)
          }
        })
      }else{
        res.status(400)
        res.send()
      }
    }else if(pt.includes('newuser')){
      let db=new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,(err)=>{
        if (err){
          res.status(500)
          res.send()
        }
      })
      db.serialize(function(){
        var sql='CREATE TABLE IF NOT EXISTS '
        sql += db_param.tbl.activation.name 
        sql += ' ('
        for(const [key,value] of Object.entries(db_param.tbl.activation.col)){
          sql += key 
          sql += ' '
          sql += value 
          sql +=','
        }
        sql=sql.slice(0,-1)
        sql += ')'
        db.run(sql,(err)=>{
          if(err)
            next(err)
        })
        .each('SELECT '+db_param.tbl.user+'.rowid as uid FROM '+db_param.tbl.user.name+' WHERE email=\''+req.body.email+'\'',(err,row)=>{
          if(err){
            res.status(500)
            res.send()
          }else{
            if(row.uid){
              res.status(409)
              res.send()
            }
            const secret=hashCode(new Date().toString())
            db.run('INSERT INTO '+db_param.activation.tblname+' (name,secret,email) VALUES (\''+req.body.username+'\',\''+secret+'\',\''+req.body.email+'\')',(err)=>{
              if(err){
                res.status(500)
                res.send()
              }else{
                sendActivationCode(secret,req.body.email,req)
                res.status(200)
                res.send()
              }
            })
          }
        })
        .close()
      })
    }else if(pt.includes('newapp')){
      const name=req.body.appname
      const main=req.body.url
      const redi=req.body.redirect
      const email=req.body.email
      if(!(name&&email)){
        res.status(400)
        res.send()
      }else{
        let adb= new sqlite3.Database(db_param.dbname,sqlite3.OPEN_READWRITE |sqlite3.OPEN_CREATE,(err)=>{
          if(err){
            res.status(500)
            res.send()
          }
          })
        adb.serialize(function(){
          hash.update(new Date().toString())
          var sql='CREATE TABLE IF NOT EXISTS '
          sql += db_param.pend.tblname 
          sql += ' ('
          for(const [key,value] of Object.entries(db_param.app.col)){
            sql += key 
            sql += ' '
            sql += value 
            sql +=','
          }
          sql=sql.slice(0,-1)
          sql += ')'
          adb.run(sql,(err)=>{
            if(err){
              res.status(500)
              res.send()
            }
          })
          .each('SELECT main_uri FROM '+db_path.pend.name+' WHERE name=\''+name+'\'',(err,row)=>{
            if(err){
              res.status(500)
              res.send()
            }
            if(row.main_uri){
              res.status(409)
              res.send()
            }
          })
          .run('INSERT INTO '+db_param.pend.name+' (name,main_uri,redirect_uri,submission_date,submitted_by) VALUES (\''+name+'\',\''+main+'\',\''+redi+'\',\''+new Date().toString()+'\',\''+email+'\')',(err)=>{
            if(err){
              res.status(500)
              res.send()
            }
          })
          res.status(200)
          res.send()
        })
      }
    }else if(pt.includes('activate')){
    }
  }
}

let token_key='jGtk6BQRKCtTBTwvBgIPSYDv8XMeahRj'

function generateToken(token,callback){
  var jwt=require('jsonwebtoken')
  jwt.sign(token.access_token,token_key,{algorithms:'HS256'},(err,result)=>{
    if(err){
      callback(err)
    }else{
      token.access_token=result
      callback(err,token)
    }
  })
}

function decodeToken(token,callback){
  var jwt=require('jsonwebtoken')
  jwt.verify(token,token_key,{algorithms:'HS256'},(err,result)=>{
    if(err)
      callback(err)
    else 
      callback(err,result)
  })
}

function hashCode(password){
  const hash=new SHA3(256)
  hash.update(password)
  return hash.digest('hex')
}
function sendActivationCode(secret,email,req){
  var nodemailer=require('nodemailer')
  var sender=nodemailer.createTransport({host:'smtp.163.com',
                                         port:25,
                                         secure:false,
                                         auth:{user:'ku.china@163.com',
                                               pass:'1995115'}})
  sender.verify(function(err,success){
    if(err){
      console.log('failed to connect to email')
    }else{
      sender.sendMail({from:'account@xiaoweb.com',
      to:email,
      subject:'Activate your account',
      text:req.baseUrl+''})
    }
  })
}
function sendMail(title,correspondent,text){
  var nodemailer=require('nodemailer')
  let transporter=nodemailer.createTransport({
    sendmail:true,
    newline:'windows',
    path:''
  })
}
