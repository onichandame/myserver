module.exports=function(req,res){
  if(req.method=='GET'){
  const end=req.path
    if(end=='/authorise'){
      let db=require(path.resolve(__dirname,''))
      const qry=req.query
      validate_app(req,res,(req,res)=>{
      })
      if(qry.response_type=='code'){
      }else if(qry.response_type=='token'){
      }
    }
  }else if(req.method=='POST'){
  }
}
module.exports.authenticate=function(req,res,next){
  const path=require('path')

  const username=req.body.username
  const password=req.body.password

  const db_param=require(path.resolve(__dirname,"db.js"))
  const sqlite3=require('sqlite3').verbose()
  let db=new sqlite3.Database(db_param.user.dbname,sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,(err)=>{
    if (err)
      next(err)
  })
  db.serialize(function(){
    var sql='CREATE TABLE IF NOT EXISTS '
    sql += db_param.user.tblname 
    sql += ' ('
    for(const [key,value] of Object.entries(db_param.user.col)){
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
      .all('SELECT password FROM '+db_param.user.tblname+' WHERE username=\''+username+'\' ',(err,rows)=>{
        if(err){
          next(err)
        }else{
          if(rows.length==0){
            console.log('you have not registered yet')
          }else{
            if(rows.length>1)
              next(err)
            const { SHA3 }=require('sha3')
            const hash=new SHA3(256)
            hash.update(password)
            const salt=hash.digest('hex')
            rows.forEach((row)=>{
              if(row.password!=salt){
                next(err)
              }
              next()
              //Handle return
            })
          }
        }
    })
      .close()
  })
}

module.exports.authorise=function(req,res,next){

  const username=req.body.username

  const path=require('path')
  const db_param=require(path.resolve(__dirname,"db.js"))
  const sqlite3=require('sqlite3').verbose()
  var token={info:{username:username}}
  token.expires_in=3600
  token.token_type="bearer"
  token.created_at=new Date().toString()

  let db=new sqlite3.Database(db_param.user.dbname,sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,(err)=>{
    if (err)
      next(err)
  })
  db.serialize(function(){
    db.all('SELECT email,level,active FROM '+db_param.user.tblname+' WHERE username=\''+username+'\'',(err,rows)=>{
      if(err)
        next(err)
      if(rows.length!=1)
        next(err)
      const row=rows[0]
      token.scope=row.level
      token.info.email=row.email
      token.hash=generateToken(token)
      res.set('Authorisation',JSON.stringify(token))

      next()
    })
  })
}

module.exports.validated=function(req,res,next){
  let cp=require('cookie-parser')
  const token=JSON.parse(res.get('Authorisation'))
  var time=new Date(token.created_at)
  time.setSeconds(time.getSeconds()+token.expires_in)
  res.cookie("token",token.hash,{expires:time})
  res.render('success.login.pug')
}

let token_key='jGtk6BQRKCtTBTwvBgIPSYDv8XMeahRj'

function generateToken(obj){
  var aes256=require('aes256')
  if(typeof obj==='string')
    return aes256.encrypt(token_key,obj)
  else
    return aes256.encrypt(token_key,JSON.stringify(obj))
}

module.exports.decodeToken=function(obj){
  var aes256=require('aes256')
  let token={}
  try{
    token=JSON.parse(aes256.decrypt(token_key,obj))
    if(!token)
      throw 'invalide token:'
    var time=new Date(token.created_at)
    time.setSeconds(time.getSeconds()+token.expires_in)
    if(time<new Date())
      throw 'expired token'
    if(!token.hasOwnProperty('scope'))
      throw 'invalide token(no scope)'
  }catch(e){
    token.info={username:'guest'}
    token.scope=-1
  }
  return token
}
