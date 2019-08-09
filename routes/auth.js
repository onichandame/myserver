module.exports.auth=function(req,res,next){
  const token=req.get('Authorization')
  if(!token){
    res.redirect('/auth')
  }else{
    if(!validate(token))
      res.redirect('/auth')
  }
  next()
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
              if(row.password==salt){
                next()
              }
              //Handle return
            })
          }
        }
    })
      .close()
  })
}

module.exports.authorise=function(req,res){

  const username=req.query.username

  const path=require('path')
  const db_param=require(path.resolve(__dirname,"db.js"))
  const sqlite3=require('sqlite3').verbose()
  var token={info:{username:username}}
  token.expires_in=3600
  token.access_token=generateToken(username)
  token.token_type="bearer"

  let db=new sqlite3.Database(db_param.user.dbname,sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,(err)=>{
    if (err)
      next(err)
  })
  db.serialize(function(){
    db.all('SELECT level,active FROM '+db_param.user.tblname+' WHERE username=\''+username+'\')',(err,rows)=>{
      if(err)
        next(err)
      if(rows.length!=1)
        next(err)
      rows.forEach((row)=>{
        const lvl=row.level
        switch(lvl){
          case 0:
            token.scope='admin'
            break
          case 1:
            token.scope='user'
            break
          case 2:
            token.scope='guest'
            break
          default:
            next(err)
            break
        }
        token.info.email=row.email
        res.set('Authorisation',JSON.stringify(token))

        const DB=require('tingodb')().Db()
        var db=newDB(db_param.token.dbname,{})
        var col=db.collection(db_param.colname)
        token.created_at=Date.now().toString()
        col.insertOne(token,(err,result)=>{
          res.redirect('/')
        })
      })
    })
  })
}

function validate(token){
  try{
    var obj=JSON.parse(token)
    if(!(obj.access_token&&obj.token_type&&obj.expires_in&&obj.scope&&obj.info))
      throw 'invalide token'
    const db_param=require(path.resolve(__dirname,'db.js')).token
    var DB=require('tingodb')().Db
    var db=new DB(db_param.dbname,{})
    var col=db.collection(db_param.colname)
    col.findOne({access_token:obj.access_token},(err,item)=>{
      if(!item||err)
        return false 
      const creation=new Date(item.created_at)
      const timediff=(Date.now()-creation)/1000
      if(timediff>token.expires_in)
        return false 
    })
  }catch(e){
    return false
  }
  return true
}

let token_key='jGtk6BQRKCtTBTwvBgIPSYDv8XMeahRj'

function generateToken(username){
  var aes256=require('aes256')
  return aes256.encrypt(token_key,username+Date.now().toString())
}
