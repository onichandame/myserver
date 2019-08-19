module.exports=function(req,res){
  const path=require('path')
  if(req.path.includes('worklog'))
    require(path.resolve(__dirname,'worklog.js'))(req,res)
  else 
    require(path.resolve(__dirname,'../utility/render.js'))(req,res,'app.main.pug')
}
