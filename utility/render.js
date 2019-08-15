module.exports=function(req,res,filename){
  let token=req.cookies.token
  const path=require('path')
  const decode=require(path.resolve(__dirname,'../routes/auth.js')).decodeToken
  res.render(filename,{auth:decode(token)})
}
