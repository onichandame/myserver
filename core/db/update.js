const path=require('path')
const connect=require(path.resolve(__dirname,'connect.js'))

function update(tbl,fields,cond){
  function getsql(){
    function getkv(){
      var result=''
      for(let [k,v] of Object.entries(fields)){
        result+=k+'=\''+v+'\','
      }
      return result.slice(0,-1)
    }
    return `UPDATE ${tbl} SET ${getkv} WHERE ${cond}`
  }
  return connect()
  .then(db=>{
    return db.run(getsql())
  })
}

module.exports=update
