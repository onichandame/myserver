const path=require('path')
const fs=require('fs')
const dfterrdesc={code:500,
  desc:'Internal error in server',
  sol:['Contact the maintainer']
}
function dfterr(err,req,res){
  if(res.status)
    stderr(err,req,res)
  else
    res.status(500).render('oauth/err.pug',dfterrdesc)
}
function stderr(err,req,res){
  if(err.code)
    res.status(err.code)
  else
    res.status(500)
  const errdesc=path.resolve(__dirname,'errdesc.json')
  fs.readFile(errdesc,(err,data)=>{
    tmp=JSON.parse(data)
    if(err){
      console.log(JSON.stringify(err))
      dfterr({},req,res)
    }else{
      res.xhr ? res.send() : 
                res.render('oauth/err.pug',(res.status in tmp ? {code:res.status,desc:tmp[res.status].description.sol:tmp[res.status].solution} : dfterrdesc))
    }
  })
}
module.exports=function(err,req,res,next){
  if(err){
    if(err.message)
      console.log(err.message)
    else
      console.log('Error Occurred but No Message!')
    if(res.status)
      stderr(err,req,res)
    else
      dfterr(err,req,res)
  }else{
    if(res.status){
      if(res.locals.page){
        if(res.locals.params){
          req.xhr ? res.send() : res.render(res.locals.page,res.locals.params)
        }else{
          req.xhr ? res.send() : res.render(res.locals.page)
        }
      }else{
        res.send()
      }
    }else{
      dfterr({},req,res)
    }
  }
}
