module.exports=function(err,req,res,next){
  if(err.code==1){
  }else{
    console.log(err.message)
  }
}
