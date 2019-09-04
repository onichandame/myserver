module.exports=function(err,req,res,next){
  if(err.code==500){
    res.status(err.code)
    res.render('unknown.err.pug')
  }else if(err.code==303){
    res.status(err.code)
    if(res.location)
      res.set('Location',req.originalUrl)
    if(req.xhr)
      res.send()
    else
      res.render('Retry')
  }else if(err.code==400){
    res.status(err.code)
    res.send()
  }
}
