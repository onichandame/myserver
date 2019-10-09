const path=require('path')
const pug=require('pug')
const logger=require(path.resolve(global.basedir,'core','logger','logger.js'))

function sendActivationCode(username,url,email){
  let text=pug.renderFile(path.resolve(__dirname,'email'+'activate.pug'),{username:username,lk:url})
  sendMail('Activate Your Account',email,text,(err)=>{
    if(err)
      logger.info(err.message ? err.message : 'Failed to send activation code to '+username)
  })
}
function sendApp(info){
  info.title='Your app has been registered'
  info.body=pug.renderFile(path.resolve(global.basedir,'views','newapp.pug'),info)
  return sendMail(info)
}

function sendMail(mail){
  if(!(mail&&mail.title&&mail.correspondent&&mail.body))
    return Promise.reject(mail)
  var sendmail=require('sendmail')({silent:true})
  return new Promise((resolve,reject)=>{
    sendmail({
      from:global.config.mail.master,
      to:mail.correspondent,
      subject:mail.title,
      html:mail.body},(err,reply)=>{
        if(err)
          return reject(err)
        else
          return resolve()
    })
  })
}

const dft={
  master:'no-reply@xiao.com'
}

function init(){
  return new Promise((resolve,reject)=>{
    const config=global.config.mail
    if(!(config&&config.master))
      global.config.mail=dft
    return null
  })
}

module.exports={
  sendActivationCode:sendActivationCode,
  sendApp:sendApp,
  init:init
}
