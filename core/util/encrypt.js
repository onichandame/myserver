/* Handle encryption
 *
 * 1. manage encrytion keys
 * 2. hash string
 * 3. encode JWT
 * 4. decode JWT
 */
var jwt=require('jsonwebtoken')
const path=require('path')
const {SHA3}=require('sha3')
const fs=require('fs')
const {exit,getConfig,checkTable}=require(path.resolve(__dirname,'base.js'))
const randomstring=require('randomstring')
const {insert,select}=require(path.resolve(__dirname,'db.js'))
const logger=require(path.resolve(__dirname,'logger.js')).logger

async function updateKey(callback){
  const key=randomstring.generate({length:33,charset:'alphabetic'})
  insert('encrypt',{key:key,creation_date:new Date().getTime()/1000,expires_in:3600*24},(lastID)=>{
    callback(key)
  })
}

async function getKey(date,callback){
  if(date){
    var key=''
    select('encrypt',['key'],'creation_date<'+date.getTime()/1000+' AND creation_date+expires_in>'+date.getTime()/1000+' ORDER BY creation_date ASC',(row)=>{
      key=row.key
    },(num)=>{
      if(num<1)
        updateKey((key)=>{
          return callback(key)
        })
      else
        return callback(key)
    })
  }else{
    select('encrypt',['key'],'creation_date<'+new Date().getTime()/1000+' AND creation_date+expires_in>'+new Date().getTime()/1000+' ORDER BY creation_date DESC LIMIT=1',(row)=>{
      return callback(row.key)
    },(num)=>{
      if(num<1)
        updateKey((key)=>{
          return callback(key)
        })
    })
  }
}

async function generateJWT(obj,callback){
  getKey((key)=>{
    jwt.sign(obj,key,{algorithm:'HS256'},(err,result)=>{
      if(err)
        return logger.info('Failed to sign JWT for '+JSON.stringify(obj)) && callback(false)
      else
        return callback(result)
    })
  })
}

async function decodeJWT(token,date,callback){
  if(date)
    getKey(date,(key)=>{
      output(key)
    })
  else
    getKey((key)=>{
      output(key)
    })
  function output(key){
    jwt.verify(token,key,{algorithm:'HS256'},(err,result)=>{
      if(err)
        return logger.info('Failed to decode JWT for '+token) && callback(false)
      else
        return callback(result)
    })
  }
}

function hash(password){
  const hash=new SHA3(256)
  hash.update(password)
  return hash.digest('hex')
}

async function checkConfig(callback){
  getConfig((param)=>{
    const enparam=param.encrypt
    if(!(enparam&&enparam.name&&enparam.cols))
      exit('Failed to get enough info for encryption from config file')
    else
      return callback(enparam)

  })
}

async function initEncrypt(callback){
  checkConfig((param)=>{
    param.alias='encrypt'
    checkTable(param,(flag)=>{
      if(flag)
        return callback()
      else
        exit('Failed to create table for encryption')
    })
  })
}

module.exports={
  generateJWT:generateJWT,
  decodeJWT:decodeJWT,
  hash:hash,
  initEncrypt:initEncrypt
}
