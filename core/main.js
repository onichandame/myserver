module.exports=function(req,res){
  const path=require('path')
  const request=require('request')
  if(req.method=='GET'){
    res.render('core/main/main.pug')
  }
}
