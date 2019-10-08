const path=require('path')
const init=require(path.resolve(__dirname,'init.js'))

async function get(){
  return global.config ? null : init()
}

module.exports=get
