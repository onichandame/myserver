const path=require('path')
const initMail=require(path.resolve(__dirname,'mail.js')).init
const initEncrypt=require(path.resolve(__dirname,'encrypt.js')).init

function init(){
  return initMail()
  .then(initEncrypt)
}

module.exports=init
