const path=require('path')
const sendmail=require('sendmail')({silent:true})

const logger=require(path.resolve('..','logger','logger.js'))

module.exports=function(mail){
  if(!(mail && mail.from && mail.to))
    return Promise.reject(`invalid mail could not be sent ${JSON.stringify(mail)}`)
  return new Promise((resolve,reject)=>{
    sendmail({
      from:global.config.mail.master,
      to:mail.to,
      subject:mail.title | '',
      html:mail.body | ''},(err,reply)=>{
        if(err)
          return reject(err)
        else
          return resolve()
    })
  })
  .catch(logger.warn)
}
