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
        sql += db_param.tbl.user.name 
        sql += ' ('
        for(const [key,value] of Object.entries(db_param.tbl.user.col)){
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
        .each('SELECT rowid FROM '+db_param.tbl.user.name+' WHERE username=\''+req.body.username+'\'',(err,row)=>{
          if(err){
            res.status(500)
            res.send()
          }else{
            if(row){
              res.status(409)
              res.send()
            }
            db.run('INSERT INTO '+db_param.user.tblname+' (username,password,email,active,creation_date) VALUES (\''+req.body.username+'\',\''+hashCode(req.body.password)+'\',\''+req.body.email+',0,\''+new Date().toString()+'\')',(err)=>{
              if(err){
                res.status(500)
                res.send()
              }else{
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
      if(!(name)){
        res.status(400)
        res.send()
      }else{
        let adb= new sqlite3.Database(db_param.app.dbname,sqlite3.OPEN_READWRITE |sqlite3.OPEN_CREATE,(err)=>{
          if(err){
            res.status(500)
            res.send()
          }
          })
        adb.serialize(function(){
          const hash=new SHA3(256)
          hash.update(new Date().toString())
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
          adb.run(sql,(err)=>{
            if(err)
              next(err)
          })
          .run('INSERT INTO '+db_param.app.tblname+' (name,main_uri,redirect_uri,secret) VALUES (\''+name+'\',\''+main+'\',\''+redi+'\',\''+hash.digest('hex')+'\')',(err)=>{
            if(err)
              next(err)
          })
          .each('SELECT rowid,secret FROM '+db_param.app.tblname+' WHERE name=\''+name+'\' AND main_uri=\''+main+'\'',(err,row)=>{
            if(err){
              res.status(500)
              res.send()
            }else{
              res.json({aid:row.rowid,
                        secret:row.secret})
            }
          })
        })
      }
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
