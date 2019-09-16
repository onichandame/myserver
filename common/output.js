/* Render output pages according to status
 */
const path=require('path')
const fs=require('fs')
const logger=require(path.resolve(__dirname,'..','core','util','logger.js'))

const dfterrdesc={code:500,
  desc:'Internal error in server',
  sol:['Contact the maintainer']
}

function dfterr(err,req,res){
  if(res.status)
    stderr(err,req,res)
  else
    res.status(500).render('error.pug',dfterrdesc)
}
function stderr(err,req,res){
  if(err.code)
    res.status(err.code)
  else
    res.status(500)
  const errdesc=path.resolve(__dirname,'errdesc.json')
  fs.readFile(errdesc,(err,data)=>{
    if(err)
      logger.error('Failed to read errdesc')
    try{
      tmp=JSON.parse(data)
      res.xhr ? res.send() : 
                res.render('error.pug',(res.status in tmp ? {code:res.status,desc:tmp[res.status].description.sol:tmp[res.status].solution} : dfterrdesc))
      }
    }catch(e){
      logger.error('Failed to parse JSON from errdesc')
    }
  })
}
module.exports=function(err,req,res,next){
  if(err){
    if(err.message)
      logger.info(err.message)
    else
      logger.info('Error Occurred but No Message!')
    if(res.status)
      stderr(err,req,res)
    else
      dfterr(err,req,res)
  }else{
    if(res.status){
      const firstdigit=(''+res.status)[0]
      if(firstdigit=='3')
        return res.send()
    }
    return res.locals.page ? (res.locals.params ? res.render(res.locals.page,res.locals.params) : res.render(res.locals.page)) : res.send()
  }
}
