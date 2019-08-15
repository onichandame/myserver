module.exports=function(req,res){
  if(req.xhr){
    if(req.path.includes('worklog'))
      worklog(req,res)
  }
}
function worklog(req,res){
  const path=require('path')
  let token=require(path.resolve(__dirname,'auth.js')).decodeToken(req.cookies.token)
  if(req.path.includes('tasklist')){
    res.set('Content-Type','application/json')
    res.json(worklogGetTask(token))
  }
}
function worklogGetTask(token){
  if(token.info.username=='guest')
    return
  else
}
