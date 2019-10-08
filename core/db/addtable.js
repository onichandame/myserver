const path=require('path')
const connect=require(path.resolve(__dirname,'connect.js'))

function addtable(schema){
  function getsql(){
    function getkv(){
      var result='('
      for(let [k,v] of Object.entries(schema.cols)){
        result+=`${k} ${v},`
      }
      return result.slice(0,-1)+')'
    }
    return `CREATE TABLE IF NOT EXISTS ${schema.name} ${getkv()}`
  }
  if(!(schema&&schema.name&&schema.cols))
    return Promise.reject({message:'Requires table name and coltype, received '+JSON.stringify(schema)})
  return connect((db)=>{
    db.serialize(()=>{
      db.run(getsql,(err)=>{return})
    })
  })
}
