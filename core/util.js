const path=require('path')
const config_path=path.resolve(__dirname,'../config.json')
const fs=require('fs')
const {SHA3}=require('sha3')
const pug=require('pug')

async function sendActivationCode(info){
  var code={}
  code.email=info.email
  code.secret=info.secret
  code.creation_date=info.creation_date
  const baseurl=info.baseurl
  const given_name=info.given_name
  const file=path.resolve(__dirname,'../views/activate.pug')
  generateJWT(code,(err,result)=>{
    if(err){
      console.log('failed signing')
      console.log(err.message)
    }else{
      let text=pug.renderFile(file,{given_name:given_name,
                                     lk:baseurl+'?code='+result})
      sendMail('Activate Your Account',info.email,text,(err)=>{
        if(err)
          console.log(err)
      })
    }
  })
}
async function sendApp(info,callback){
  const file=path.resolve(__dirname,'../views/init.app.pug')
  let text=pug.renderFile(file,info)
  sendMail('Your app has been registered',info.email,text,(err)=>{
    if(err)
      console.log(err)
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

async function generateJWT(obj,callback){
  var jwt=require('jsonwebtoken')
  fs.readFile(config_path,(err,data)=>{
    const config=JSON.parse(data)
    const db_key=config.db_key
    jwt.sign(obj,db_key,{algorithm:'HS256'},(err,result)=>{
      if(err)
        callback(err)
      else
        callback(err,result)
    })
  })
}

async function decodeJWT(token,callback){
  var jwt=require('jsonwebtoken')
  fs.readFile(config_path,(err,data)=>{
    const config=JSON.parse(data)
    const db_key=config.db_key
    jwt.verify(token,db_key,{algorithm:'HS256'},(err,result)=>{
      if(err)
        callback(err)
      else 
        callback(err,result)
    })
  })
}

function hashCode(password){
  const hash=new SHA3(256)
  hash.update(password)
  return hash.digest('hex')
}

module.exports={sendMail:sendMail,
  sendActivationCode:sendActivationCode,
  sendApp:sendApp,
  generateJWT:generateJWT,
  decodeJWT:decodeJWT,
  hashCode:hashCode}
