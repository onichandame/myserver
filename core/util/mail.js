const path=require('path')
const sign=require('encrypt.js').generateJWT
const decode=require('encrypt.js').decodeJWT
async function sendActivationCode(info){
  var code={}
  code.email=info.email
  code.secret=info.secret
  code.creation_date=info.creation_date
  code.uid=info.uid
  const baseurl=info.baseurl
  const given_name=info.given_name
  const file=path.resolve(__dirname,'../views/activate.pug')
  sign(code,(err,result)=>{
    if(err){
      console.log('failed signing')
      console.log(JSON.stringify(err))
    }else{
      let text=pug.renderFile(file,{given_name:given_name,
                                     lk:baseurl+'?code='+result})
      sendMail('Activate Your Account',info.email,text,(err)=>{
        if(err)
          console.log(JSON.stringify(err))
      })
    }
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
