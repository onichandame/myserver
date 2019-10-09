/* Render output pages according to status
 */
const path=require('path')
const fs=require('fs')
const logger=require(path.resolve(global.basedir,'core','logger','logger.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))

const dfterrdesc={code:500,
  desc:'Internal error in server',
  sol:['Contact the maintainer']
}

function send(err,req,res){
  if(err.code)
    res.status(err.code)
  else
    res.status(500)
  return select('TableError',['code,description','solutions'],'code='+res.status)
  .then(rows=>{
    if(rows.length!=1)
      throw 'code '+res.status+' requires description and solutions!'
    res.render('error.pug',{code:res.status,desc:rows[0].description,sol:rows[0].solutions})
    return err
  })
}

function log(e){
  if(e.log)
    return logger.write(e.message,e.level)
  else
    return Promise.resolve()
}

module.exports=function(err,req,res,next){
  return send()
  .then(log)

  if(err.log){
    if(!err.message)
      err.message=''
    logger.write(err.messge,err.level)
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
