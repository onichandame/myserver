const path=require('path')
const connect=require(path.resolve(__dirname,'connect.js'))

function select(tbl,target,cond){
  function getsql(){
    function getkv(){
      var result=''
      target.forEach((item)=>{
        result+=item+','
      })
      return result.slice(0,-1)
    }
    return `SELECT ${getkv()} FROM ${tbl} WHERE ${cond}`
  }
  return connect()
  .then(db=>{
    return db.all(getsql())
  })
}

module.exports=select
