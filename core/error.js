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
      res.render('conflict.err.pug')
  }else if(err.code==400){
    res.status(err.code)
    if(req.xhr)
      res.send()
    else
      res.render('bad.err.pug')
  }else if(err.code==401){
    res.status(err.code)
    if(req.xhr)
      res.send()
    else
      res.render('unauthorised.err.pug')
  }else if(err.code==422){
    res.status(err.code)
    if(req.xhr)
      res.send()
    else
      res.render('invalid.err.pug')
  }else if(err.code==405){
    res.status(err.code)
    if(req.xhr)
      res.send()
    else 
      res.render('method.err.pug')
  }
}
//405
