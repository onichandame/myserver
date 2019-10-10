/* Render output pages according to status
 */
const path=require('path')
const fs=require('fs')
const logger=require(path.resolve(global.basedir,'core','logger','logger.js'))
const select=require(path.resolve(global.basedir,'core','db','select.js'))

module.exports=function(err,req,res,next){
  function send(){
    if(!err)
      return new Promise((resolve,reject)=>{
        return resolve(res.page ? res.render(res.page) : res.send())
      })
    if(err.code)
      res.status(err.code)
    else
      res.status(500)
    return select('TableError',['code,description','solutions'],'code='+res.status)
    .then(rows=>{
      if(rows.length!=1)
        throw 'code '+res.status+' requires description and solutions!'
      res.render('error.pug',{code:res.status,desc:rows[0].description,sol:rows[0].solutions})
      return null
    })
  }

  function log(){
    if(err.log)
      return logger.write(err.message,err.level)
    else
      return Promise.resolve()
  }

  return send()
  .then(log)
}
