const path=require('path')
const initMail=require(path.resolve(__dirname,'mail.js')).init

function init(){
  return initMail()
}

module.exports=init
