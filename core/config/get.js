const path=require('path')
const init=require(path.resolve(__dirname,'init.js'))

async function get(){
  return new Promise((resolve,reject)=>{
    if(!global.config)
      init()
  })
}
module.exports=get
