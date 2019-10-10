const path=require('path')
const pug=require('pug')
const logger=require(path.resolve(global.basedir,'core','logger','logger.js'))

const viewdir=path.resolve(__dirname,'mail')

function sendActivationCode(info){
  info.title='Activate Your Account'
  info.body=pug.renderFile(path.resolve(viewdir,'activate.pug'),info)
  info.correspondent=info.email
  return sendMail(info)
}

function sendApp(info){
  info.title='Your app has been registered'
  info.body=pug.renderFile(path.resolve(viewdir,'newapp.pug'),info)
  return sendMail(info)
}

/* compulsory argument: mail{title,correspondent,body}
 */
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
  .catch(e=>{
    logger.warn(e)
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
    return resolve(null)
  })
}

module.exports={
  sendActivationCode:sendActivationCode,
  sendApp:sendApp,
  init:init
}
