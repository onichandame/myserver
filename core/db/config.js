const path=require('path')
const config=require(path.resolve(__dirname,'..','config','config.js'))

const dft={
  path:'core.sqlite3'
}

module.exports=function(){
  return config.get('datadir')
  .then(d=>{dft.path=resolve(d,dft.path)})
  .then(()=>{return config.get('db')})
  .then(old=>{
    if(!old) return config.set('db',dft)
    const keys=Object.keys(dft)
    for(int i=0;i<keys.length;++i){
      if(!(keys[i] in old)) return config.set('db',dft)
    }
  })
  .then(()=>{return config.get('db')})
}
