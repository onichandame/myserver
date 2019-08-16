module.exports=function(req,res){
  const path=require('path')
  console.log('hellp')
  if(req.xhr){
    if(req.path.includes('worklog'))
      require(path.resolve(__dirname,'../app/worklog.js'))(req,res)
  }
}
