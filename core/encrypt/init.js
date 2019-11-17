/* handle encryption related tasks
 * hash: create hash by SHA-256
 * encode: create jwt
 * decode: extract object from jwt
 */
const path=require('path')
const randomstring=require('randomstring')

const config=require(path.resolve(__dirname,'config.js'))
const addtable=require(path.resolve('..','db','addtable.js'))
const select=require(path.resolve('..','db','select.js'))
const insert=require(path.resolve('..','db','insert.js'))

module.exports=function(){
  return checkTable()
  .then(checkKey)

  function checkTable(){
    return config()
    .then(c=>{
      return addtable(c)
    })
  }

  function checkKey(){
    return config()
    .then(c=>{
      return select(c.name,['key'])
      .then(rows=>{
        if(!rows.length) return addKey()
        else if(!rows[0].key.length) return addKey()
      })

      function addKey(){
        return insert(c.name,{date:new Date().getTime()/1000,key:randomstring.generate({length:33,charset:'alphabetic'})})
      }
    })
  }
}
