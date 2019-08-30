var meta={auth_server:'/oauth'}
meta.request_uri=meta.auth_server+'/request'
meta.auth_uri=meta.auth_server+'/authorise?response_type=token&client_id=0&redirect_uri&scope=read write'
meta.redi_uri='/gottoken'
meta.aid=1
meta.secret='441848627b073309a17255edce0d64be86125ed334ebdd6ebf379a90fee394f4'
module.exports=function(req,res){
  const path=require('path')
  const request=require('request')
  const sqlite3=require('sqlite3').verbose()
  const db_param=require(path.resolve(__dirname,"db.js"))
  if(req.method=='GET'){
    if(req.path.includes('request')){
    }else if(req.path.includes('gottoken')){
      res.render('core/main/gottoken.pug')
    }else{
      res.render('core/main/main.pug')
    }
  }else if(req.method=='POST'){
    if(req.path.includes('validate')){
      const sid=req.body.sid
      if(!sid){
        res.status(400)
        res.send()
      }
      let db=new sqlite3.Database(db_param.session.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)={
        if (err){
          res.status(500)
          res.send()
        }
      })
      db.serialize(function(){
        db.each('SELECT token,created_at,expires_in FROM '+db_param.session.tblname+' WHERE sid=\''+sid+'\'',(err,row)=>{
          if(err){
            res.status(500)
            res.send()
          }
          var cd=new Date(row.created_at)
          cd.setSeconds(cd.getSeconds()+row.expires_in)
          if(cd.getTime()>new Date().getTime()){
            res.status(401)
            res.send()
          }
          request.post(meta.request_uri,{token:row.token},(err,httpResponse,body)=>{
            if(err){
              res.status(401)
              res.send()
            }
            res.status(200)
            const info=JSON.parse(body)
            res.json({username:info.username,
                      email:info.email})
          })
        })
      })
    }else if(req.path.includes('request')){
      const tok=req.body.tok
      if(!tok){
        res.status(400)
        res.send()
      }
      let db=new sqlite3.Database(db_param.session.dbname,sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE,(err)={
        if (err){
          res.status(500)
          res.send()
        }
      })
      request.post(meta.request_uri,{token:tok},(err,httpResponse,body)=>{
      })
      db.serialize(function(){
        var sql='CREATE TABLE IF NOT EXISTS '
        sql += db_param.session.tblname 
        sql += ' ('
        for(const [key,value] of Object.entries(db_param.session.col)){
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
    }else{
    }
  }
}
