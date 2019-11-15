module.exports=function(req,res,next){
  return checkParam()
  .then(create)
  .catch(handleError)
  .then(reply)
}
