const okitchen=require('okitchen')
const checkpath=require('checkpath')
const path=require('path')
const fs=require('fs')
const fsp=fs.promises

const filepath=path.resolve(__dirname,'announcement.txt')

module.exports=function(req,res){
  return checkpath(filepath,{type:'file',permission:'r'})
    .then(async ()=>{
      res.status(200)
      res.body=await fsp.readFile(filepath,'utf8')
    })
    .catch(e=>{
      res.status(500)
      res.body=`Server failed. ${JSON.stringify(e)}`
    })
    .then(()=>{return okitchen.common.reply(res)})
}
