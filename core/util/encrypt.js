var jwt=require('jsonwebtoken')
const {SHA3}=require('sha3')
const fs=require('fs')

const config_path=path.resolve(__dirname,'config.json')

async function generateJWT(obj,callback){
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
  fs.readFile(config_path,(err,data)=>{
    if(err)
      console.log(JSON.stringify(err))
    const config=JSON.parse(data)
    const db_key=config.db_key
    jwt.verify(token,db_key,{algorithm:'HS256'},(err,result)=>{
      if(err){
        console.log('error occurred')
        callback(err)
      }else {
        callback(null,result)
      }
    })
  })
}

function hashCode(password){
  const hash=new SHA3(256)
  hash.update(password)
  return hash.digest('hex')
}

module.exports={generateJWT:generateJWT,
  decodeJWT:decodeJWT,
  hashCode:hashCode
}
