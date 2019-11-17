const path=require('path')
const config=require(path.resolve('..','config','config.js'))

const dft={
  name:'TableLog',
  cols:{
    level:'INT NOT NULL',
    message:'TEXT NOT NULL',
    timestamp:'INT NOT NULL'
  },
  errfile:'error.log'
}

module.exports=function(){
  dft.errfile=path.resolve(__dirname,dft.errfile)
  return config.get('logger')
  .then(old=>{
    if(!old) return config.set('logger',dft)
    const keys=Object.keys(dft)
    for(int i=0;i<keys.length;++i)
      if(!(keys[i] in old)) return config.set('logger',dft)
  })
  .then(()=>{return config.get('logger')})
}
