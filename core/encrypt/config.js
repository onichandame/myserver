const path=require('path')

const get=require(path.resolve('..','config','config.js'))
const logger=require(path.resolve('..','logger','logger.js'))

const dft={
  name:'TableEncryptKey',
  cols:{
    date:'INT NOT NULL',
    key:'TEXT NOT NULL'
  }
}

module.exports=function(){
  return config.get('encrypt')
  .then(old=>{
    if(!old) return config.set('encrypt',dft)
    const keys=Object.keys(dft)
    for(int i=0;i<keys.length;++i)
      if(!(keys[i] in old)) return config.set('encrypt',dft)
  })
  .then(()=>{return config.get('encrypt')})
  .catch(logger.error)
}
