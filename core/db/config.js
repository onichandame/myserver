const path=require('path')
const config=require(path.resolve(__dirname,'..','config','config.js'))

const dft={
  path:path.resolve(global.basedir,'data'),
  name:'core.sqlite3'
}

function config(){
  return config.get('db')
  .then(old=>{
    if(!old) return config.set('db',dft)
    Object.keys(dft).forEach(key=>{
      if(!(key in old)) return config.set('db',dft)
    })
  })
  return get()
  .then(c=>{
    let param=c.db
    if(!(param&&param.path&&param.name))
      global.config.db=dft
    return global.config.db
  })
}

module.exports=config
