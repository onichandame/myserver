const path=require('path')
const connect=require(path.resolve(__dirname,'connect.js'))

function drop(tbl,cond){
  function getsql(){
    return `DELETE FROM ${tbl}${cond ? ` WHERE ${cond}` : ''}`
  }
  return connect()
  .then(db=>{
    return db.run(getsql())
  })
}

module.exports=drop
