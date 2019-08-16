module.exports=function(req,res){
  console.log('hellp')
  const path=require('path')
  const token=require(path.resolve(__dirname,'auth.js')).decodeToken(req.cookies.token)
  if(req.path.includes('tasklist')){
    res.set('Content-Type','application/json')
    res.json(worklogGetTask(token))
  }
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
                colname:{tasklist:'task'}}
