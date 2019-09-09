module.exports=function(req,res,next){
  if(req.method=='GET'){
    res.status(200)
    res.render('authenticate.pug')
  }else if(req.method=='POST'){
  }else{
    next({code:405})
  }
}
