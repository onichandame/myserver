module.exports=function(req,res,next){
  const token=require(path.resolve(__dirname,'../app/auth.js')).decode(req.cookies.token)
  if(token==false){
    next({code:1,message:'invalid token'})
  }else{
    if(token.expired){
      if(token.refresh_token){
        res.redirect('/oauth/ref')
      }else{
      }
    }else{
      next()
    }
  }
}
