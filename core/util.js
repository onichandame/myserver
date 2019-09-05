module.exports.sendActivationCode= async function(info){
  var code.email=info.email
  code.secret=info.secret
  code.creation_date=info.creation_date
  const req=info.req
  const given_name=info.given_name
  const pug=require('pug')
  const fs=require('fs')
  const file='../views/activation.pug'
  fs.readFile(file,(err,data)=>{
    if(err){
      console.log(err.message)
    }else{
      let text=pug.compile(data,{secret:secret,
        given_name:given_name})
      sendMail('Activate Your Account',email,text)
    }
  })
}
module.exports.sendMail=async function(title,correspondent,text){
  var sendmail=require('sendmail')({logger:{debug:console.log,
    info:console.info,
    warn:console.warn,
    error:console.error},
    silent:false})
  sendmail({
    from:'no-reply@xiao.com',
    to:correspondent,
    subject:title,
    html:text},(err,reply)=>{
      if(err)
        console.log(err.message)
  })
}

const config_path='../config.json'

function generateToken(token,callback){
  var jwt=require('jsonwebtoken')
  fs.readFile(config_path,(err,data)=>{
    const db_key=data.db_key
    jwt.sign(token.access_token,db_key,{algorithms:'HS256'},(err,result)=>{
      if(err){
        callback(err)
      }else{
        token.access_token=result
        callback(err,token)
      }
    })
  })
}

function decodeToken(token,callback){
  var jwt=require('jsonwebtoken')
  fs.readFile(config_path,(err,data)=>{
    jwt.verify(token,token_key,{algorithms:'HS256'},(err,result)=>{
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
