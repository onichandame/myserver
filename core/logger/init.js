const path=require('path')
const config=require(path.resolve(__dirname,'config.js'))
const addTable=require(path.resolve(basedir,'core','db','addtable.js'))

function init(){
  return config()
  .then((c)=>{
    return addTable(c)
  })
}

module.exports=init
