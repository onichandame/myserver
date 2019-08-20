module.exports=function(req,res){
  const path=require('path')
  const token=require(path.resolve(__dirname,'../routes/auth.js')).decodeToken(req.cookies.token)
  if(req.path.includes('tasklist')){
    if(req.method.includes('GET')){
      res.status(200)
      res.set('content-type','application/json')
      if(token.scope<0)
        res.send()
      var Db=require('tingodb')().Db 
      var db=new Db(db_param.dbname,{})
      db.open((err,db)=>{
        var collection=db.collection(db_param.colname.tasklist,(err,collection)=>{
          collection.find({username:token.info.username}).toArray((err,result)=>{
            if(err){
              console.log(err.message)
              res.send()
            }else{
              res.json(result)
            }
            db.close()
          })
        })
      })
    }else if(req.method.includes('POST')){
      let task={importance:req.body.importance,
                description:req.body.description,
                username:token.info.username,
                created_at:new Date()}
      var Db=require('tingodb')().Db 
      var db=new Db(db_param.dbname,{})
      var collection=db.collection(db_param.colname.tasklist)
      collection.insert(task,(err,result)=>{
        if(err){
          console.log(err.message)
          res.status(500)
          res.send()
        }else{
          res.status(200)
          res.send()
        }
      })
    }
  }else if(req.path.includes('diary')){
    if(req.method.includes('GET')){
      res.set('Content-Type','application/json')
      res.status(200)
      var Db=require('tingodb')().Db 
      var db=new Db(db_param.dbname,{})
      db.open((err,db)=>{
        if(err){
          console.log(err.message)
          res.status(500)
          res.send()
        }
        var collection=db.collection(db_param.colname.log,(err,collection)=>{
          if(err){
            console.log(err.message)
            res.status(500)
            res.send()
          }
          collection.find({username:token.info.username}).toArray((err,result)=>{
            if(err){
              console.log(err.message)
              res.send()
            }else{
              res.json(result)
            }
          })
        })
      })
    }else if(req.method.includes('POST')){
      let log={fulltext:req.body.comment,
               task:req.body.id,
               username:token.info.username,
               created_at:new Date()}
      var Db=require('tingodb')().Db 
      var db=new Db(db_param.dbname,{})
      var collection=db.collection(db_param.colname.log)
      collection.insert(log,(err,result)=>{
        if(err){
          console.log(err.message)
          res.status(500)
          res.send()
        }else{
          console.log(result)
          res.status(200)
          res.send()
        }
      })
    }
  }else{
    require(path.resolve(__dirname,'../utility/render.js'))(req,res,'worklog.app.pug')
  }
}
const db_param={dbname:require('path').resolve(__dirname,'../db/worklog.tingo'),
                colname:{tasklist:'task',
                         log:'diary'}}
