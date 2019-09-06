module.exports.sendActivationCode= async function(info){
  var code={}
  code.email=info.email
  code.secret=info.secret
  code.creation_date=info.creation_date
  const req=info.req
  const given_name=info.given_name
  const pug=require('pug')
  const fs=require('fs')
  const file='../views/activate.pug'
  fs.readFile(file,(err,data)=>{
    if(err){
      console.log(err.message)
    }else{
      generateJWT(code,(err,result)=>{
        if(err){
          console.log(err.message)
        }else{
          fs.readFile('../config.json',(err,conf)=>{
            if(err){
              console.log(err.message)
            }else{
              const config=JSON.parse(conf)
              code.baseurl=config.base
              let text=pug.compile(data,{given_name:given_name,
                                         lk:baseurl+'?code='+result})
              sendMail('Activate Your Account',email,text,(err)=>{
                console.log(err.message)
              })
            }
          })
        }
      })
    }
  })
}
module.exports.sendApp=async function(info,callback){
  const fs=require('fs')
  const file='../views/init.app.pug'
  fs.readFile(file,(err,data)=>{
    if(err){
      console.log(err.message)
    }else{
      let text=pug.compile(data,info)
      sendMail('Your app has been registered',info.email,text,(err)=>{
        if(err)
          callback(err)
      })
    }
  })
}
module.exports.sendMail=async function(title,correspondent,text,callback){
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
        callback(err)
  })
}

const config_path='../config.json'

module.exports.generateJWT=async function(obj,callback){
  var jwt=require('jsonwebtoken')
  fs.readFile(config_path,(err,data)=>{
    const config=JSON.parse(data)
    const db_key=config.db_key
    jwt.sign(obj,db_key,{algorithms:'HS256'},(err,result)=>{
      if(err)
        callback(err)
      else
        callback(err,result)
    })
  })
}

module.exports.decodeJWT=async function(token,callback){
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

module.exports.hashCode=function(password){
  const hash=new SHA3(256)
  hash.update(password)
  return hash.digest('hex')
}
