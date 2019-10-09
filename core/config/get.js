const path=require('path')
const init=require(path.resolve(__dirname,'init.js'))

function get(){
  if(global.config)
    return Promise.resolve(global.config)
  else
    return init()
}

module.exports=get
