const path=require('path')
const pug=require('pug')
const logger=require(__dirname,'logger.js')
async function sendActivationCode(username,url,email){
  let text=pug.renderFile(path.resolve(__dirname,'email'+'activate.pug'),{username:username,lk:url})
  sendMail('Activate Your Account',email,text,(err)=>{
    if(err)
      logger.info(err.message ? err,message : 'Failed to send activation code to '+username)
  })
}
async function sendApp(info,callback){
  const file=path.resolve(__dirname,'../views/init.app.pug')
  let text=pug.renderFile(file,info)
  sendMail('Your app has been registered',info.email,text,(err)=>{
    if(err)
      console.log(JSON.stringify(err))
  })
}
async function sendMail(title,correspondent,text,callback){
  var sendmail=require('sendmail')({silent:true})
  sendmail({
    from:'no-reply@xiao.com',
    to:correspondent,
    subject:title,
    html:text},(err,reply)=>{
      console.dir(reply)
      callback(err)
  })
}

module.exports={sendActivationCode:sendActivationCode,
  sendApp:sendApp
}
