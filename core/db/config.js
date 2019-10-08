const path=require('path')
const get=require(path.resolve(global.basedir,'core','config','get.js'))

const dft={
  path:path.resolve(global.basedir,'db'),
  name:'core.sqlite3'
}

function config(){
  return get()
  .then(()=>{
    console.log(global.config)
    console.log('above')
    let param=global.config.db
    if(!(param&&param.path&&param.name))
      global.config.db=dft
    return global.config.db
  })
}

module.exports=config
