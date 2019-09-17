const fs=require('fs')
function exit(message){
  console.log(message)
  process.exit(1)
}
async function getConfig(callback){
  fs.readFile(global.config,(err,data)=>{
    if(err)
      exit('Failed to read configuration file '+config)
    try{
      const dbparam=JSON.parse(data)
      return callback(dbparam)
    }catch(e){
      if(e.message)
        exit(e.message)
      exit('Failed to read database config from file '+config)
    }
  })
}
module.exports={
  exit:exit,
  getConfig:getConfig
}
