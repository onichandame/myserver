/**
 * @module routers/app
 */
module.exports=function(req,res){
  const path=require('path')
  if(req.path=='/worklog'){
    require(path.resolve(__dirname,'worklog/main.js'))(req,res)
  }else{
    require(path.resolve(__dirname,'../utility/render.js'))(req,res,'app.main.pug')
    res.render('')
  }
}
