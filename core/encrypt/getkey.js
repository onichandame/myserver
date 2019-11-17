const path=require('path')

const select=require(path.resolve('..','db','select.js'))
const logger=require(path.resolve('..','logger','logger.js'))
const config=require(path.resolve(__dirname,'config.js'))

module.exports=function(){
  return config()
  .then(c=>{
    return select(c.name,['key'],'key IS NOT NULL ORDER BY date DESC LIMIT 1')
  })
  .then(rows=>{
    if(!(rows.length && rows[0].key && typeof rows[0].key==='string' && rows[0].key.length==33)) return Promise.reject('encryption key not found')
    return rows[0].key
  })
  .catch(logger.error)
}
