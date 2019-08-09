module.exports.display=function(req,res,next){
  const fs=require('fs')
  const path=require('path')
  var html=fs.readFileSync(path.resolve(__dirname,'../static/base.head.html'))
  html+=fs.readFileSync(path.resolve(__dirname,'../static/register.html'))
  html+=fs.readFileSync(path.resolve(__dirname,'../static/base.foot.html'))
  res.send(html)
}

module.exports.register=function(req,res,next){
  const path=require('path')
  const db_param=require(path.resolve(__dirname,"db.js"))

  const username=req.body.username
  const password=req.body.password
  const email=req.body.email
  const { SHA3 }=require('sha3')
  const hash=new SHA3(256)
  hash.update(password)

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
  })
    .all('SELECT password FROM '+db_param.user.tblname+' WHERE username=\''+username+'\'',(err,rows)=>{
      if(err){
        next(err)
      }else{
        if(rows.length>0){
          console.log('already exists')
        }else{
          db.run('INSERT INTO '+db_param.user.tblname+' (username,password,active,email,creation_date,level) VALUES (\''+username+'\',\''+hash.digest('hex')+'\','+'1'+',\''+email+'\',\''+Date.now().toString()+'\','+'1)',(err)=>{
            if(err)
              next(err)
            else{
              const fs=require('fs')
              var html=fs.readFileSync(path.resolve(__dirname,'../static/base.head.html'))
              html+=fs.readFileSync(path.resolve(__dirname,'../static/register.success.html'))
              html+=fs.readFileSync(path.resolve(__dirname,'../static/base.foot.html'))
              res.send(html)
            }
          })
        }
      }
    })
    .close()
}
