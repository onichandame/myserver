module.exports=function(req,res,next){
  const path=require('path')
  const qry=req.query
  const sqlite3=require('sqlite3').verbose()
  const {SHA3}=require('sha3')
  const db_param=require(path.resolve(__dirname,"db.js"))
  if(req.method=='GET'){
    res.render('core/auth/newuser.auth.pug')
  }else if(req.method=='POST'){

  }
}

let token_key='jGtk6BQRKCtTBTwvBgIPSYDv8XMeahRj'

function generateToken(token,callback){
  var jwt=require('jsonwebtoken')
  jwt.sign(token.access_token,token_key,{algorithms:'HS256'},(err,result)=>{
    if(err){
      callback(err)
    }else{
      token.access_token=result
      callback(err,token)
    }
  })
}

function decodeToken(token,callback){
  var jwt=require('jsonwebtoken')
  jwt.verify(token,token_key,{algorithms:'HS256'},(err,result)=>{
    if(err)
      callback(err)
    else 
      callback(err,result)
  })
}

function hashCode(password){
  const hash=new SHA3(256)
  hash.update(password)
  return hash.digest('hex')
}
