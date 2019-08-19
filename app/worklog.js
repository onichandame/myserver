module.exports=function(req,res){
  const path=require('path')
  const token=require(path.resolve(__dirname,'../routes/auth.js')).decodeToken(req.cookies.token)
  if(req.path.includes('tasklist')){
    if(req.method.includes('GET')){
      res.set('Content-Type','application/json')
      res.status(200)
      res.json(worklogGetTask(token))
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
      res.json(worklogGetLog(token))
    }else if(req.method.includes('POST')){}
  }else{
    require(path.resolve(__dirname,'../utility/render.js'))(req,res,'worklog.app.pug')
  }
}
function worklogGetLog(token){
  if(token.scope<0)
    return
  var Db=require('tingodb')().Db 
  var db=new Db(db_param.dbname,{})
  var collection=db.collection(db_param.colname.log)
  collection.find({username:token.info.username}).toArray((err,result)=>{
    return result
  })
}
function worklogGetTask(token){
  if(token.scope<0)
    return
  var Db=require('tingodb')().Db 
  var db=new Db(db_param.dbname,{})
  var collection=db.collection(db_param.colname.tasklist)
  collection.find({username:token.info.username}).toArray((err,result)=>{
    return result
  })
}
const db_param={dbname:require('path').resolve(__dirname,'../db/worklog.tingo'),
                colname:{tasklist:'task',
                         log:'diary'}}
